param(
  [string]$PythonPath = 'python',
  [string]$FfmpegPath = 'ffmpeg',
  [string]$FfprobePath = 'ffprobe',
  [string]$Voice = 'Microsoft Zira Desktop',
  [string]$ScenesPath = '',
  [switch]$AudioOnly
)
$ErrorActionPreference = 'Stop'
$taskRepo = Split-Path -Parent $PSScriptRoot
if (-not $ScenesPath) { $ScenesPath = Join-Path $PSScriptRoot 'demo-scenes.json' }
$taskManifest = Get-Content -LiteralPath $ScenesPath -Raw -Encoding UTF8 | ConvertFrom-Json
$taskBuild = Join-Path $taskRepo '.tools\demo-build'
$taskAudio = Join-Path $taskBuild 'audio'
New-Item -ItemType Directory -Path $taskAudio -Force | Out-Null
Add-Type -AssemblyName System.Speech
$taskSynth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $taskVoices = @($taskSynth.GetInstalledVoices() | Where-Object {$_.Enabled} | ForEach-Object {$_.VoiceInfo.Name})
  if ($taskVoices -notcontains $Voice) { throw "Requested installed voice is unavailable: $Voice" }
  $taskSynth.SelectVoice($Voice)
  $taskSynth.Rate = [int]$taskManifest.voice_rate
  $taskSynth.Volume = 100
  foreach ($taskScene in $taskManifest.scenes) {
    $taskWave = Join-Path $taskAudio ($taskScene.id + '.wav')
    $taskSynth.SetOutputToWaveFile($taskWave)
    $taskSynth.Speak([string]$taskScene.narration)
    $taskSynth.SetOutputToNull()
    Write-Output ("Narration generated: " + $taskScene.id)
  }
  @{voice=$Voice;voice_type='Windows offline synthetic TTS';rate=$taskSynth.Rate;source_manifest=(Split-Path -Leaf $ScenesPath);contains_cloned_person_voice=$false} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $taskBuild 'voice.json') -Encoding UTF8
} finally { $taskSynth.Dispose() }
if (-not $AudioOnly) {
  & $PythonPath (Join-Path $PSScriptRoot 'render-demo.py') --scenes $ScenesPath --ffmpeg $FfmpegPath --ffprobe $FfprobePath
  if ($LASTEXITCODE -ne 0) { throw "Video rendering failed with exit code $LASTEXITCODE" }
}
