#!/usr/bin/env python3
"""
NSM menu music generator — renders 'nsm-menu-loop' (server-list music).

A seamless ~68.6s synthwave/ambient loop: A minor, Am9-Fmaj7-Cmaj7-G6,
84 BPM (exactly 31500 samples/beat at 44.1kHz -> sample-accurate looping).
Sections: A(0-7) pads -> B(8-15) +bass/arp/drums -> C(16-23) +lead, then
loops back to A (natural reset). All release tails and delay tails are
folded around the loop boundary, so loop-forever playback has no seam.

  python3 generate.py            # writes nsm-menu-loop.wav + .mp3 here

Pure numpy synthesis — no samples, no external audio libs (lameenc for mp3).
"""
import numpy as np
import lameenc
import struct, os

SR = 44100
BPM = 84
SPB = SR * 60 // BPM          # 31500 samples per beat (exact)
BARS = 24
BEATS = BARS * 4
N = BEATS * SPB               # loop length in samples
TAIL = 4 * SPB                # extra render room for releases/delays

rng = np.random.default_rng(7)

def t_axis(dur_samples):
    return np.arange(dur_samples) / SR

# ---------- voices (band-limited additive: no aliasing by construction) ----
def saw_note(freq, dur_samples, fc=5200.0, cutoff_hz=16000.0):
    """Additive saw with exponential brightness rolloff (fc) and hard band limit."""
    t = t_axis(dur_samples)
    out = np.zeros(dur_samples)
    k = 1
    while freq * k < cutoff_hz:
        amp = (1.0 / k) * np.exp(-(freq * k) / fc)
        out += amp * np.sin(2 * np.pi * freq * k * t + rng.uniform(0, 2 * np.pi))
        k += 1
        if k > 90:
            break
    return out

def soft_note(freq, dur_samples, harmonics=((1, 1.0), (2, 0.28), (3, 0.10))):
    """Warm lead/pluck tone: few harmonics with fast rolloff."""
    t = t_axis(dur_samples)
    out = np.zeros(dur_samples)
    for k, a in harmonics:
        if freq * k >= 16000:
            break
        out += a * np.sin(2 * np.pi * freq * k * t)
    return out

def env_adsr(n, a, d, s_level, r, hold=None):
    """Attack/decay/sustain/release envelope over n samples (release inside n)."""
    hold = n if hold is None else hold
    an, dn, rn = int(a * SR), int(d * SR), int(r * SR)
    hold = min(hold, n)
    env = np.concatenate([
        np.linspace(0, 1, max(an, 1), endpoint=False),
        np.linspace(1, s_level, max(dn, 1), endpoint=False),
        np.full(max(hold - an - dn, 0), s_level),
        np.linspace(s_level, 0, max(min(rn, n - hold), 1)),
    ])
    if len(env) < n:
        env = np.pad(env, (0, n - len(env)))
    return env[:n]

# ---------- musical data ----------------------------------------------------
NOTE = lambda name: 440.0 * 2 ** ((name - 69) / 12.0)   # midi -> Hz

# one chord per bar: Am9, Fmaj7, Cmaj7, G6 (midi note numbers)
CHORDS = [
    ([57, 60, 64, 71], 45),   # Am9 (A3 C4 E4 B4), bass A2
    ([53, 57, 60, 64], 41),   # Fmaj7 (F3 A3 C4 E4), bass F2
    ([60, 64, 67, 71], 48),   # Cmaj7 (C4 E4 G4 B4), bass C3
    ([55, 59, 62, 64], 43),   # G6 (G3 B3 D4 E4), bass G2
]
def chord_at(bar):
    return CHORDS[bar % 4]

# lead melody, bars 16-23 (midi, start beat within 32, dur beats)
MELODY = [
    (76, 0.0, 1.5), (72, 1.5, 0.5), (71, 2.0, 1.0),          # Am: E5 C5 B4
    (69, 4.0, 2.0), (72, 6.0, 1.0), (76, 7.0, 1.0),          # F:  A4 C5 E5
    (67, 8.0, 1.5), (76, 9.5, 0.5), (74, 10.0, 1.75),        # C:  G4 E5 D5
    (71, 12.0, 3.0),                                          # G:  B4 (hold)
    (76, 16.0, 1.0), (74, 17.0, 1.0), (72, 18.0, 2.0),        # Am: E5 D5 C5
    (69, 20.0, 2.0), (67, 22.0, 1.0), (69, 23.0, 1.0),        # F:  A4 G4 A4
    (76, 24.0, 2.5), (74, 26.5, 0.5), (72, 27.0, 1.0),        # C:  E5 D5 C5
    (71, 28.0, 1.5), (74, 29.5, 0.5), (71, 30.0, 1.25),       # G:  B4 D5 B4
]

def place(buf, sig, start_sample, gain=1.0):
    """Add sig into buf at start_sample (clips at buf end; tail buf is longer)."""
    i = int(start_sample)
    j = min(i + len(sig), len(buf))
    if i < len(buf):
        buf[i:j] += sig[: j - i] * gain

# ---------- render buses -----------------------------------------------------
TOTAL = N + TAIL
padL, padR = np.zeros(TOTAL), np.zeros(TOTAL)
bass, arp = np.zeros(TOTAL), np.zeros(TOTAL)
lead = np.zeros(TOTAL)
kick, hat = np.zeros(TOTAL), np.zeros(TOTAL)

# --- pads: every bar, 3 detuned voices per note, slow envelopes
for bar in range(BARS):
    notes, _ = chord_at(bar)
    start = bar * 4 * SPB
    dur = int(4 * SPB * 1.35)          # overlap into next bar (crossfade-ish wash)
    for ni, m in enumerate(notes):
        f = NOTE(m)
        v = saw_note(f, dur, fc=3400.0 + 600.0 * ni)
        e = env_adsr(dur, a=0.9, d=0.4, s_level=0.75, r=1.1, hold=int(3.6 * SPB))
        v *= e
        # stereo: detuned pair + per-voice amplitude shimmer (subtle chorus feel)
        trem = 1.0 + 0.035 * np.sin(2 * np.pi * (0.13 + 0.05 * ni) * t_axis(dur) + ni * 1.7)
        vl = saw_note(f * 0.9959, dur, fc=3000.0) * e * trem
        vr = saw_note(f * 1.0041, dur, fc=3800.0) * e * (2.0 - trem)
        g = 0.145 / len(notes)
        place(padL, vl, start, g)
        place(padR, vr, start, g)
        place((padL if ni % 2 else padR), v, start, g * 0.55)  # mid filler

# --- bass: sections B and C (bars 8-23), syncopated roots
for bar in range(8, BARS):
    _, bm = chord_at(bar)
    start = bar * 4 * SPB
    for pos, oct_up in ((0.0, 0), (1.75, 0), (2.5, 1), (3.5, 0)):
        f = NOTE(bm + 12 * oct_up)
        dur = int(0.42 * SPB * 1.4)
        sig = np.sin(2 * np.pi * f * t_axis(dur)) + 0.22 * np.sin(2 * np.pi * 2 * f * t_axis(dur)) + 0.07 * np.sin(2 * np.pi * 3 * f * t_axis(dur))
        sig *= env_adsr(dur, a=0.008, d=0.16, s_level=0.5, r=0.12)
        place(bass, sig, start + int(pos * SPB), 0.42)

# --- arp: 16ths on chord tones (octave up), sections B and C
ARP_PAT = [0, 1, 2, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 0, 3, 1]
for bar in range(8, BARS):
    notes, _ = chord_at(bar)
    start = bar * 4 * SPB
    for i, idx in enumerate(ARP_PAT):
        f = NOTE(notes[idx] + 12)
        dur = int(0.30 * SPB)
        sig = soft_note(f, dur, harmonics=((1, 1.0), (2, 0.5), (3, 0.22), (4, 0.09)))
        sig *= env_adsr(dur, a=0.004, d=0.10, s_level=0.12, r=0.10)
        vel = 0.9 + 0.1 * np.sin(i * 1.3)
        place(arp, sig, start + int(i * 0.25 * SPB), 0.13 * vel)

# --- lead: melody over bars 16-23 with vibrato
for m, beat, dur_beats in MELODY:
    f = NOTE(m)
    start = (16 * 4 + beat) * SPB
    dur = int(dur_beats * SPB * 1.15)
    t = t_axis(dur)
    vib = 1.0 + 0.0045 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.35)
    ph1 = 2 * np.pi * f * np.cumsum(vib) / SR
    sig = np.sin(ph1) + 0.30 * np.sin(2 * ph1) + 0.10 * np.sin(3 * ph1)
    sig *= env_adsr(dur, a=0.045, d=0.25, s_level=0.72, r=0.22)
    place(lead, sig, start, 0.30)

# --- drums
for bar in range(BARS):
    start = bar * 4 * SPB
    for pos in (0.0, 2.0):                                   # kick on 1 & 3
        dur = int(0.24 * SPB)
        t = t_axis(dur)
        f = 118 * np.exp(-t * 26) + 44
        ph = 2 * np.pi * np.cumsum(f) / SR
        sig = np.sin(ph) * np.exp(-t * 13)
        sig += 0.25 * np.sin(2 * ph) * np.exp(-t * 30)
        place(kick, sig, start + int(pos * SPB), 0.62 if bar >= 8 else 0.34)
    step = 0.5 if bar >= 8 else 1.0                          # hats: 8ths (B/C), quarters (A)
    pos = 0.5 if bar >= 8 else 0.5
    while pos < 4:
        dur = int(0.055 * SPB)
        noise = rng.standard_normal(dur)
        noise = np.diff(noise, prepend=0.0)                  # crude highpass
        sig = noise * np.exp(-t_axis(dur) * 90)
        place(hat, sig, start + int(pos * SPB), 0.055 if bar >= 8 else 0.030)
        pos += step

# ---------- effects: wrapped delays (this is what makes the loop seamless) ---
def wrap_delay(x, beats, gain):
    d = int(beats * SPB)
    return x + gain * np.roll(x, d)                          # roll == delay that wraps the loop

arp = wrap_delay(arp, 0.75, 0.34) + wrap_delay(arp, 1.5, 0.16)
lead = wrap_delay(lead, 0.75, 0.26) + wrap_delay(lead, 1.125, 0.12)

# ---------- fold the tail back onto the head (seamless release/delay tails) --
def fold2(bus):
    """Everything rendered past the loop end wraps back onto the start."""
    out = bus[:N].copy()
    tail = bus[N:]
    out[: len(tail)] += tail
    return out

padL, padR = fold2(padL), fold2(padR)
bass, arp, lead, kick, hat = fold2(bass), fold2(arp), fold2(lead), fold2(kick), fold2(hat)

# ---------- mix ---------------------------------------------------------------
mixL = padL * 1.0 + bass * 0.95 + arp * 0.85 + lead * 1.0 + kick * 0.95 + hat * 0.7
mixR = padR * 1.0 + bass * 0.95 + arp * 1.0 + lead * 1.0 + kick * 0.95 + hat * 1.0
# bass/kick stay centred; arp/hat lean right, pads are wide

# gentle master glue: tanh soft clip + normalize
def master(x):
    x = np.tanh(x * 1.25)
    return x / np.max(np.abs(x)) * 0.891                     # ~ -1 dBFS

mixL, mixR = master(mixL), master(mixR)

# ---------- write wav + mp3 ----------------------------------------------------
stereo = np.empty(N * 2, dtype=np.int16)
stereo[0::2] = np.clip(mixL * 32767, -32768, 32767).astype(np.int16)
stereo[1::2] = np.clip(mixR * 32767, -32768, 32767).astype(np.int16)

out_dir = os.path.dirname(os.path.abspath(__file__))
wav_path = os.path.join(out_dir, 'nsm-menu-loop.wav')
with open(wav_path, 'wb') as f:
    f.write(b'RIFF')
    f.write(struct.pack('<I', 36 + len(stereo)))
    f.write(b'WAVEfmt ')
    f.write(struct.pack('<IHHIIHH', 16, 1, 2, SR, SR * 4, 4, 16))
    f.write(b'data')
    f.write(struct.pack('<I', len(stereo)))
    f.write(stereo.tobytes())
print(f'[ok] {wav_path} ({N / SR:.3f}s, {os.path.getsize(wav_path)/1e6:.1f} MB)')

enc = lameenc.Encoder()
enc.set_bit_rate(192)
enc.set_in_sample_rate(SR)
enc.set_channels(2)
enc.set_quality(2)
mp3 = enc.encode(stereo.tobytes())
mp3 += enc.flush()
mp3_path = os.path.join(out_dir, 'nsm-menu-loop.mp3')
with open(mp3_path, 'wb') as f:
    f.write(mp3)
print(f'[ok] {mp3_path} ({os.path.getsize(mp3_path)/1e6:.2f} MB)')

# ---------- sanity --------------------------------------------------------------
print(f'duration exact: {N} samples = {N/SR:.4f}s = {BARS} bars @ {BPM} BPM')
print(f'peak L/R: {np.max(np.abs(mixL)):.3f} / {np.max(np.abs(mixR)):.3f}')
print(f'rms  L/R: {np.sqrt(np.mean(mixL**2)):.3f} / {np.sqrt(np.mean(mixR**2)):.3f}')
seam = np.max(np.abs(np.concatenate([mixL[-4410:], mixL[:4410]]))) - np.min(np.abs(np.concatenate([mixL[-4410:], mixL[:4410]])))
print(f'loop seam check (window delta): {seam:.4f}')
print(f'first/last samples: {mixL[0]:+.4f} {mixL[-1]:+.4f}')
