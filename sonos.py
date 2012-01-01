"""
Copyright 2011 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

# See http://github.com/glenmurphy/sonosredeye
# This is a hardcoded and even more brittle Python version of sonos.js and is included for fun. The state nonsense
# is to see if I can track the req value and the play state (to avoid repeated 'on' commands being sent) in a single
# int in a minimum of lines.
# You can make this two lines shorter if you don't need to turn your receiver on first, or use a RedEye macro.

import time, urllib2, string, math
while not time.sleep(2):
  reqs = string.atoi(urllib2.urlopen("http://10.0.1.16:1400/status/proc/driver/audio/dsp").read().split("\n")[9].split(":")[0])
  if not vars().has_key('state'): state = reqs # Could init outside, but then might miss start behavior.
  if state > 0 and reqs != abs(state):
    urllib2.urlopen("http://10.0.1.19:82/cgi-bin/play_iph.sh?/devicedata/1377-99999-01.isi%201")
    time.sleep(5)
    urllib2.urlopen("http://10.0.1.19:82/cgi-bin/play_iph.sh?/devicedata/CaptubELVo4%201")
    state = -reqs
  else: state = math.copysign(reqs, abs(state) - reqs) # Positive if value stays the same, else stays negative