const bash = `#!/bin/bash
# Rick Astley in your Terminal.
# By Serene and Justine Tunney <3
version='1.2'
rick='https://keroserene.net/lol'
video="$rick/astley80.full.bz2"
# TODO: I'll let someone with mac or windows machine send a pull request
# to get gsm going again :)
audio_gsm="$rick/roll.gsm"
audio_raw="$rick/roll.s16"
audpid=0
NEVER_GONNA='curl -s -L http://bit.ly/10hA8iC | bash'
MAKE_YOU_CRY="$HOME/.bashrc"
red='\\x1b[38;5;9m'
yell='\\x1b[38;5;216m'
green='\\x1b[38;5;10m'
purp='\\x1b[38;5;171m'
echo -en '\\x1b[s'  # Save cursor.

has?() { hash $1 2>/dev/null; }
cleanup() { (( audpid > 1 )) && kill $audpid 2>/dev/null; }
quit() { echo -e "\\x1b[2J \\x1b[0H \${purp}<3 \\x1b[?25h \\x1b[u \\x1b[m"; }

usage () {
  echo -en "\${green}Rick Astley performs ♪ Never Gonna Give You Up ♪ on STDOUT."
  echo -e "  \${purp}[v$version]"
  echo -e "\${yell}Usage: ./astley.sh [OPTIONS...]"
  echo -e "\${purp}OPTIONS : \${yell}"
  echo -e " help   - Show this message."
  echo -e " inject - Append to \${purp}\${USER}\${yell}'s bashrc. (Recommended :D)"
}
for arg in "$@"; do
  if [[ "$arg" == "help"* || "$arg" == "-h"* || "$arg" == "--h"* ]]; then
    usage && exit
  elif [[ "$arg" == "inject" ]]; then
    echo -en "\${red}[Inject] "
    echo $NEVER_GONNA >> $MAKE_YOU_CRY
    echo -e "\${green}Appended to $MAKE_YOU_CRY. <3"
    echo -en "\${yell}If you've astley overdosed, "
    echo -e "delete the line \${purp}\\"$NEVER_GONNA\\"\${yell}."
    exit
  else
    echo -e "\${red}Unrecognized option: \\"$arg\\""
    usage && exit
  fi
done
trap "cleanup" INT
trap "quit" EXIT

# Bean streamin' - agnostic to curl or wget availability.
obtainium() {
  if has? curl; then curl -s $1
  elif has? wget; then wget -q -O - $1
  else echo "Cannot has internets. :(" && exit
  fi
}
echo -en "\\x1b[?25l \\x1b[2J \\x1b[H"  # Hide cursor, clear screen.

#echo -e "\${yell}Fetching audio..."
if has? afplay; then
  # On Mac OS, if |afplay| available, pre-fetch compressed audio.
  [ -f /tmp/roll.s16 ] || obtainium $audio_raw >/tmp/roll.s16
  afplay /tmp/roll.s16 &
elif has? aplay; then
  # On Linux, if |aplay| available, stream raw sound.
  obtainium $audio_raw | aplay -Dplug:default -q -f S16_LE -r 8000 &
elif has? play; then
  # On Cygwin, if |play| is available (via sox), pre-fetch compressed audio.
  obtainium $audio_gsm >/tmp/roll.gsm.wav
  play -q /tmp/roll.gsm.wav &
fi
audpid=$!

#echo -e "\${yell}Fetching video..."
# Sync FPS to reality as best as possible. Mac's freebsd version of date cannot
# has nanoseconds so inject python. :/
python <(cat <<EOF
import sys
import time
fps = 25; time_per_frame = 1.0 / fps
buf = ''; frame = 0; next_frame = 0
begin = time.time()
try:
  for i, line in enumerate(sys.stdin):
    if i % 32 == 0:
      frame += 1
      sys.stdout.write(buf); buf = ''
      elapsed = time.time() - begin
      repose = (frame * time_per_frame) - elapsed
      if repose > 0.0:
        time.sleep(repose)
      next_frame = elapsed / time_per_frame
    if frame >= next_frame:
      buf += line
except KeyboardInterrupt:
  pass
EOF
) < <(obtainium $video | bunzip2 -q 2> /dev/null)`;

const html = `<!DOCTYPE html>
<html lang="en" style="width: 100%; height: calc(100vh - 20px);">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rickroll</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css">
</head>
<body style="width: 100%; height: calc(100vh - 20px);">
    <div style="width: 100%; height: calc(100vh - 20px); display: flex; align-items: center; justify-content: center;">
        <div style="margin-bottom: 30px;">
            <center>
                <h1 style="margin-bottom: 0px;">Give the gift of an</h1>
                <h1 style="font-size: 60px; margin-top: 0px;">Unskippable Rickroll</h1>
            </center>
            <pre><code style="display: flex; flex-direction: row;"><span style="padding-right: 20px;">user@localhost ~ $</span><input style="flex-grow: 1; margin-right: 12px; display: inline-block; height: calc(100% - 4px); padding: 10px; padding-bottom: 9px; transform: translate(-2px, 2px); margin: -10px; box-sizing: border-box;" readonly value="curl -sL https://rr.dino.icu | bash" /></code></pre>
        </div>
    </div>
</body>
</html>`;

export default function handler (req, res) {
    const { 'user-agent': userAgent } = Object.fromEntries(req.rawHeaders.reduce((chunks, el, i) => (i % 2 ? chunks[chunks.length - 1].push(el.toLowerCase()) : chunks.push([el.toLowerCase()]), chunks), []));

    const curl = userAgent.includes('curl');

    console.log(curl);

    if (curl) {
        res.send(bash);
    } else {
        res.send(html);
    }
}