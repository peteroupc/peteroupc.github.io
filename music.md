# A request for a Public-Domain music synthesis library and instrument banks

To improve support for MIDI (Musical Instrument Digital Interface) music playback in open-source and other applications, I challenge the community to write the following items, all of which must be released to the public domain (Creative Commons Zero).

- A cross-platform open-source library for _software_ synthesis of MIDI data stored in standard MIDI files (SMF, .mid), using instrument sound banks in SoundFont 2 (.sf2), downloadable sounds (.dls), and in OPL2, OPL3, and other FM synthesis sound banks, and possibly also in Timidity++/UltraSound patch format (.cfg, .pat).  (Similar to _Fluidsynth_, but in the public domain.  In addition, the source code in the non-public-domain _libADLMIDI_, _libOPNMIDI_, and _OPL3BankEditor_ may be useful here.)
    - The library should support popular loop-point conventions found in MIDI files.
    - The library should support seeking of MIDI files such that a pause and resume function can be offered by a media player.
- An instrument sound bank for wavetable synthesis of all instruments and drum noises in the General MIDI specification.
    - Instruments should correspond as closely as possible to those in the General MIDI specification, but should be small in file size or be algorithmically generated.
    - Instruments can be generated using the public-domain single-cycle wave forms found in the AdventureKid Wave Form collection, found at: [**AKWF-FREE**](https://github.com/KristofferKarlAxelEkstrand/AKWF-FREE).
    - The samples for each instrument are preferably generated by an algorithm, such as one that renders the instrument's tone in the frequency domain.  An example of this is found in [**`com.sun.media.sound.EmergencySoundbank`**](https://github.com/apple/openjdk/blob/xcodejdk14-release/src/java.desktop/share/classes/com/sun/media/sound/EmergencySoundbank.java), which however is licensed under the GNU General Public License version 2 rather than public domain (Creative Commons Zero).
    - The instrument sound bank should be in either SoundFont 2 (.sf2) or downloadable sounds (.dls) format.
        - A sound bank of decent quality in either format is about 4 million bytes in size.
    - The volume of all instruments in the sound bank should be normalized; some instruments should not sound louder than others.
- An instrument sound bank for FM synthesis of all instruments and drum noises in the General MIDI specification. Instruments should correspond as closely as possible to those in the General MIDI specification.

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
