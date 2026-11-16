---
aliases: [Voice recording sheet]
status: DRAFT. Made by a tool from the app's own words. Nothing has been recorded, and the words have not been reviewed
---

# Voice recording sheet: the meditation guide

[[00 START HERE|Back to Start Here]]

Made by `node tools/voice-sheet.mjs` in `app/`, from the app's word files. Run it again after any script changes;
a test fails if this note falls behind the app.

**Record nothing yet.** These scripts were written by an AI assistant and no licensed reviewer has read them
([[CONTENT-REVIEW]], "The meditation scripts"). A recording made now would have to be made again after review.
The Spanish is an unreviewed AI translation.

## What this is for

During a meditation the app can speak a few lines: a welcome, a body scan, a closing. Today the phone's own
text-to-speech reads them, which sounds like a machine. If a recording of a line is in the app, the app plays
the recording instead. Nothing else changes: the voice is optional, off in a Silent session, and the words on
screen are the same.

## How to record

- **Who.** One person per language, the same person for every line in it. A person, not a synthetic voice
  made to sound like one. They agree in writing that Tidelight may use the recordings; a founder keeps that.
- **How it should sound.** Unhurried and plain. The "calm" lines are slower and softer; the "straightforward"
  lines are brisk and even. Never whispering, never performing. Read exactly the words below.
- **The file.** One line per file, MP3, one channel, with about a third of a second of quiet at each end and
  no music or room noise. Name it exactly as the table says.
- **Where it goes.** `app/assets/voice/` and then the path in the table. The next build finds the files and
  the app uses them. A missing file is never a fault: that line falls back to the phone's voice.
- **Check.** Play each in the app, in a meditation of its type, with the sound on.

## English: 18 recordings

| File | Voice | About | Words to read |
| --- | --- | --- | --- |
| `en/intro.custom_calm.mp3` | calm | 10 s | Let's begin. Find a comfortable position and follow the circle. You can stop at any time. |
| `en/intro.custom_straightforward.mp3` | straightforward | 8 s | Let's begin. Follow the circle. Stop any time you need to. |
| `en/outro.custom_calm.mp3` | calm | 9 s | Gently come back. Notice how you feel. Thank you for taking this time. |
| `en/outro.custom_straightforward.mp3` | straightforward | 6 s | Come back. Notice how you feel. Done. |
| `en/intro.quick_calm.mp3` | calm | 5 s | Let's take one minute. Breathe with the circle. |
| `en/intro.quick_straightforward.mp3` | straightforward | 4 s | One minute. Follow the circle. |
| `en/outro.quick_calm.mp3` | calm | 5 s | Nicely done. Carry this calm with you. |
| `en/outro.quick_straightforward.mp3` | straightforward | 4 s | Done. Back to your day. |
| `en/intro.deep_calm.mp3` | calm | 17 s | Welcome. Settle into a comfortable position. There is nothing you need to do right now but breathe. If anything feels like too much, you can stop at any time. |
| `en/intro.deep_straightforward.mp3` | straightforward | 7 s | Get comfortable. Just breathe. Stop any time you need to. |
| `en/bodyScan_calm.mp3` | calm | 23 s | Bring your attention to your feet. Let them soften. Slowly move up: your legs, your belly, your chest. Let your shoulders drop. Soften your jaw and your forehead. If your mind wanders, that's okay. Gently come back. |
| `en/bodyScan_straightforward.mp3` | straightforward | 15 s | Notice your feet. Your legs. Your belly. Your chest. Drop your shoulders. Relax your jaw. If your mind wanders, come back. |
| `en/outro.deep_calm.mp3` | calm | 12 s | Slowly bring your attention back to the room. Notice how you feel. Thank you for taking this time for yourself. |
| `en/outro.deep_straightforward.mp3` | straightforward | 8 s | Come back to the room. Notice how you feel. Well done. |
| `en/intro.sleep_calm.mp3` | calm | 12 s | It's time to rest. Let your body grow heavy. Let each breath out be a little longer than the last. |
| `en/intro.sleep_straightforward.mp3` | straightforward | 8 s | Time to rest. Let your body get heavy. Breathe out slowly. |
| `en/bodyScan.sleep_calm.mp3` | calm | 20 s | Let your feet rest. Let your legs rest. Let your belly soften. Let your shoulders sink into the bed. Let your face be still. There is nothing left to do today. |
| `en/bodyScan.sleep_straightforward.mp3` | straightforward | 12 s | Rest your feet. Your legs. Your belly. Your shoulders. Your face. Nothing left to do today. |

## Spanish: 18 recordings

| File | Voice | About | Words to read |
| --- | --- | --- | --- |
| `es/intro.custom_calm.mp3` | calm | 9 s | Empecemos. Busca una postura cómoda y sigue el círculo. Puedes parar en cualquier momento. |
| `es/intro.custom_straightforward.mp3` | straightforward | 6 s | Empecemos. Sigue el círculo. Para cuando lo necesites. |
| `es/outro.custom_calm.mp3` | calm | 8 s | Vuelve con suavidad. Nota cómo te sientes. Gracias por tomarte este tiempo. |
| `es/outro.custom_straightforward.mp3` | straightforward | 5 s | Vuelve. Nota cómo te sientes. Listo. |
| `es/intro.quick_calm.mp3` | calm | 5 s | Tomemos un minuto. Respira con el círculo. |
| `es/intro.quick_straightforward.mp3` | straightforward | 4 s | Un minuto. Sigue el círculo. |
| `es/outro.quick_calm.mp3` | calm | 4 s | Muy bien. Lleva esta calma contigo. |
| `es/outro.quick_straightforward.mp3` | straightforward | 4 s | Listo. De vuelta a tu día. |
| `es/intro.deep_calm.mp3` | calm | 17 s | Te damos la bienvenida. Busca una postura cómoda. Ahora mismo no tienes que hacer nada más que respirar. Si algo se siente demasiado, puedes parar en cualquier momento. |
| `es/intro.deep_straightforward.mp3` | straightforward | 7 s | Ponte a gusto. Solo respira. Para cuando lo necesites. |
| `es/bodyScan_calm.mp3` | calm | 24 s | Lleva tu atención a los pies. Deja que se aflojen. Sube despacio: las piernas, el vientre, el pecho. Deja caer los hombros. Afloja la mandíbula y la frente. Si tu mente se va, está bien. Vuelve con suavidad. |
| `es/bodyScan_straightforward.mp3` | straightforward | 16 s | Nota tus pies. Tus piernas. Tu vientre. Tu pecho. Deja caer los hombros. Relaja la mandíbula. Si tu mente se va, vuelve. |
| `es/outro.deep_calm.mp3` | calm | 13 s | Poco a poco, lleva tu atención de vuelta a la habitación. Nota cómo te sientes. Gracias por tomarte este tiempo para ti. |
| `es/outro.deep_straightforward.mp3` | straightforward | 7 s | Vuelve a la habitación. Nota cómo te sientes. Bien hecho. |
| `es/intro.sleep_calm.mp3` | calm | 14 s | Es hora de descansar. Deja que tu cuerpo se vuelva pesado. Deja que cada exhalación sea un poco más larga que la anterior. |
| `es/intro.sleep_straightforward.mp3` | straightforward | 7 s | Hora de descansar. Deja que tu cuerpo pese. Exhala despacio. |
| `es/bodyScan.sleep_calm.mp3` | calm | 20 s | Deja descansar los pies. Deja descansar las piernas. Afloja el vientre. Deja que los hombros se hundan en la cama. Deja el rostro quieto. Hoy ya no queda nada por hacer. |
| `es/bodyScan.sleep_straightforward.mp3` | straightforward | 13 s | Descansa los pies. Las piernas. El vientre. Los hombros. El rostro. Hoy ya no queda nada por hacer. |

## Counts

36 recordings in all: 9 lines, in 2 voices, in 2 languages.
