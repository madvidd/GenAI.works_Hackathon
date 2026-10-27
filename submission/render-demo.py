"""Assemble actual screenshots and offline narration into a disclosed edited demo.

Requires installed ffmpeg/ffprobe. No browser automation, provider calls, image
generation or runtime package download occurs. Audio and intermediates remain
under the repository's ignored .tools/ directory.
"""
from pathlib import Path
import argparse, hashlib, json, re, shutil, subprocess

ROOT = Path(__file__).resolve().parents[1]

def utf8_lf(file, value):
    # FFmpeg drawtext treats Windows carriage returns as visible glyphs.
    file.write_bytes(value.replace('\r\n','\n').replace('\r','\n').encode('utf-8'))

def draw_lines(build, prefix, text, size, color, x, y, leading):
    filters=[]
    for index,line in enumerate(text.splitlines()):
        file=build/f'{prefix}-{index}.txt';utf8_lf(file,line)
        filters.append(f'drawtext=fontfile=arial.ttf:textfile={file.name}:fontsize={size}:fontcolor={color}:x={x}:y={y+index*leading},')
    return ''.join(filters)

def run(args, cwd=None):
    subprocess.run([str(x) for x in args], cwd=cwd, check=True)

def probe(ffprobe, file):
    return json.loads(subprocess.check_output([ffprobe, '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(file)], text=True))

def stamp(seconds):
    ms=round(seconds*1000)
    return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--scenes',default=str(ROOT/'submission/demo-scenes.json'))
    parser.add_argument('--ffmpeg',default='ffmpeg')
    parser.add_argument('--ffprobe',default='ffprobe')
    parser.add_argument('--smoke',action='store_true',help='Render a private 8-second technical check using an existing real screenshot; do not publish it.')
    parser.add_argument('--frames-only',action='store_true',help='Render one editorial-framing preview per scene, without encoding video.')
    args=parser.parse_args()
    spec=json.loads(Path(args.scenes).read_text(encoding='utf-8-sig'))
    build=ROOT/'.tools/demo-build';build.mkdir(parents=True,exist_ok=True)
    scenes=spec['scenes'][:1] if args.smoke else spec['scenes']
    if not args.smoke:
        missing=[s['image'] for s in scenes if not (ROOT/s['image']).is_file()]
        if missing: raise SystemExit('Actual screenshots required; no placeholders generated: '+', '.join(missing))
    font=Path('C:/Windows/Fonts/arial.ttf')
    if not font.is_file(): raise SystemExit('Arial font required for the current rendering profile.')
    shutil.copyfile(font,build/'arial.ttf')
    utf8_lf(build/'disclosure.txt',spec['disclosure'])
    all_subs=[];elapsed=0;receipt=[];clips=[]
    for i,scene in enumerate(scenes):
        image=ROOT/scene['image']
        if args.smoke: image=ROOT/'docs/images/traceharbor-desktop.png'
        audio=build/'audio'/f"{scene['id']}.wav"
        if not audio.is_file(): raise SystemExit(f'Generate offline narration first: {audio.name}')
        duration=float(probe(args.ffprobe,audio)['format']['duration'])+0.55
        if args.smoke: duration=8.0
        image_copy=build/f'frame-{i:02}.png';shutil.copyfile(image,image_copy)
        title=build/f'title-{i:02}.txt';utf8_lf(title,scene.get('headline',scene['title']))
        detail=build/f'detail-{i:02}.txt';utf8_lf(detail,scene.get('callout','Actual application capture'))
        label=build/f'label-{i:02}.txt';utf8_lf(label,scene.get('label','EVIDENCE WORKSPACE'))
        number=build/f'number-{i:02}.txt';utf8_lf(number,f'{i+1} / {len(scenes)}')
        clip=build/f'clip-{i:02}.mp4'
        # Crop coordinates are editorial framing of actual, hashed captures.
        # They do not alter app values or manufacture a product state.
        crop=scene.get('crop')
        framing=''
        if crop and not args.smoke:
            cx,cy,cw,ch=crop
            end_y=scene.get('pan_to_y',cy)
            y_expr=f'{cy}+({end_y}-{cy})*min(t/{duration:.3f},1)'
            framing=f"crop={cw}:{ch}:{cx}:'{y_expr}',"
        vf=(framing+"scale=1080:840:force_original_aspect_ratio=decrease,"
            "pad=1080:840:(ow-iw)/2:(oh-ih)/2:color=0x0B1F2A,"
            "pad=1920:1080:760:140:color=0x0B1F2A,"
            "drawbox=x=80:y=190:w=80:h=5:color=0x60E0D0:t=fill,"
            "drawtext=fontfile=arial.ttf:text='TRACEHARBOR / VENGERS':fontsize=26:fontcolor=0x60E0D0:x=80:y=64,"
            f"drawtext=fontfile=arial.ttf:textfile={label.name}:fontsize=21:fontcolor=0x60E0D0:x=80:y=230,"
            +draw_lines(build,f'headline-{i}',scene.get('headline',scene['title']),54,'white',80,286,74)
            +draw_lines(build,f'callout-{i}',scene.get('callout','Actual application capture'),29,'0xD5E4E7',80,555,48)
            +
            "drawtext=fontfile=arial.ttf:text='traceharbor.web.app':fontsize=25:fontcolor=0x60E0D0:x=80:y=920,"
            f"drawtext=fontfile=arial.ttf:textfile=disclosure.txt:fontsize=21:fontcolor=0xD5E4E7:x=80:y=1034,"
            f"drawtext=fontfile=arial.ttf:textfile={number.name}:fontsize=22:fontcolor=white:x=w-tw-80:y=1034,"
            f"fade=t=in:st=0:d=0.22,fade=t=out:st={duration-0.22:.3f}:d=0.22")
        if args.frames_only:
            run([args.ffmpeg,'-hide_banner','-loglevel','error','-y','-loop','1','-framerate','24','-i',image_copy.name,'-vf',vf,'-ss','1','-frames:v','1','-threads','1','-filter_threads','1',f'preview-{i+1:02}.png'],cwd=build)
            continue
        run([args.ffmpeg,'-hide_banner','-loglevel','warning','-y','-loop','1','-framerate','24','-i',image_copy.name,'-i',str(audio),'-vf',vf,'-af','apad,alimiter=limit=0.94','-t',f'{duration:.3f}','-c:v','libx264','-preset','veryfast','-tune','stillimage','-crf','18','-pix_fmt','yuv420p','-r','24','-threads','2','-filter_threads','1','-c:a','aac','-b:a','160k','-ar','48000','-ac','2','-movflags','+faststart',clip.name],cwd=build)
        clips.append(clip)
        sentences=[x.strip() for x in re.split(r'(?<=[.!?])\s+',scene['narration']) if x.strip()]
        weight=sum(len(x.split()) for x in sentences);at=elapsed
        spoken=max(0.1,duration-0.55)
        for sentence in sentences:
            end=at+spoken*len(sentence.split())/weight
            all_subs.append((at,end,sentence));at=end
        receipt.append({'id':scene['id'],'image':str(image.relative_to(ROOT)).replace('\\','/'),'image_sha256':hashlib.sha256(image.read_bytes()).hexdigest(),'editorial_crop':crop,'pan_to_y':scene.get('pan_to_y'),'audio_duration_seconds':round(duration-0.55,3),'scene_duration_seconds':round(duration,3),'narration':scene['narration']})
        elapsed+=duration
    if args.frames_only:
        print(json.dumps({'preview_frames':len(scenes),'directory':str(build)}))
        return
    srt='\n\n'.join(f'{i+1}\n{stamp(a)} --> {stamp(b)}\n{t}' for i,(a,b,t) in enumerate(all_subs))+'\n'
    utf8_lf(build/'captions.srt',srt)
    (build/'concat.txt').write_text(''.join(f"file '{x.name}'\n" for x in clips),encoding='utf-8')
    candidate=build/('smoke-demo.mp4' if args.smoke else 'traceharbor-demo-candidate.mp4')
    run([args.ffmpeg,'-hide_banner','-loglevel','warning','-y','-f','concat','-safe','0','-i','concat.txt','-i','captions.srt','-map','0:v','-map','0:a','-map','1:0','-c:v','copy','-c:a','aac','-af','aresample=async=1:first_pts=0','-b:a','160k','-c:s','mov_text','-metadata:s:s:0','language=eng','-metadata','title='+spec['title'],'-metadata','comment=Edited screen demonstration using actual captures, synthetic data and disclosed synthetic TTS narration.','-movflags','+faststart',candidate.name],cwd=build)
    info=probe(args.ffprobe,candidate);streams=info['streams'];duration=float(info['format']['duration'])
    videos=[s for s in streams if s['codec_type']=='video'];audios=[s for s in streams if s['codec_type']=='audio']
    assert len(videos)==1 and len(audios)==1 and videos[0]['width']==1920 and videos[0]['height']==1080
    if not args.smoke and not 60<=duration<=240: raise SystemExit(f'Demo duration {duration:.1f}s is outside the required 1–4 minute range; adjust narration rate/text.')
    report={'mode':spec['mode'],'edited_screen_demonstration':True,'synthetic_narration':True,'duration_seconds':duration,'width':1920,'height':1080,'video_codec':videos[0]['codec_name'],'audio_codec':audios[0]['codec_name'],'audio_channels':audios[0]['channels'],'has_embedded_captions':any(s['codec_type']=='subtitle' for s in streams),'smoke_only':args.smoke,'sha256':hashlib.sha256(candidate.read_bytes()).hexdigest(),'scenes':receipt,'viewed_start_to_finish':False}
    report['verification_snapshot']=spec.get('verification_snapshot')
    (build/('smoke-validation.json' if args.smoke else 'demo-validation.json')).write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({"candidate":str(candidate),"duration_seconds":duration,"resolution":"1920x1080","audio":audios[0]['codec_name'],"smoke_only":args.smoke}))

if __name__=='__main__': main()
