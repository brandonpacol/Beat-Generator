var kickSampleDir = 'samples/kicks/';
var snareSampleDir = 'samples/snares/';
var hatSampleDir = 'samples/hats/';
var kickMidiDir = 'midis/kicks/';
var snareMidiDir = 'midis/snares/';
var hatMidiDir = 'midis/hats/';

var kickMidis = ['kick1.midi', 'kick2.midi', 'kick3.midi', 'kick4.midi'];
var hatMidis = ['hat1.midi', 'hat2.midi', 'hat3.midi', 'hat4.midi'];

var kickMidi = kickMidis[getRandomInt(4)];
var snareMidi = 'snare.midi'
var hatMidi = hatMidis[getRandomInt(4)];

document.getElementById('kick-midi-download').href = kickMidiDir + kickMidi;
document.getElementById('hat-midi-download').href = hatMidiDir + hatMidi;

const generateSample = (filename, directory) => {
    const sampler = new Tone.Sampler({
        urls: {
            C3: filename,
        },
        baseUrl: directory
    }).toDestination();

    return sampler;
}

const playSample = async (sampler, midiFile) => {
    // load a midi file in the browser
    const midi = await Midi.fromUrl(midiFile);

    const now = Tone.now() + 0.5;

    midi.tracks[0].notes.forEach((note) => {
        sampler.triggerAttackRelease(
            note.name,
            note.duration,
            note.time + now,
            note.velocity
        );
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

var kick = generateSample('kick1.wav', kickSampleDir);
var snare = generateSample('snare1.wav', snareSampleDir);
var hat = generateSample('hat1.wav', hatSampleDir);

kick.volume.value = 0;
snare.volume.value = -12;
hat.volume.value = -16;

document.getElementById('generate-beat').addEventListener('click', async () => {
    let selectedKick = document.getElementById('kicks').value + '.wav';
    let selectedSnare = document.getElementById('snares').value + '.wav';
    let selectedHat = document.getElementById('hats').value + '.wav';

    kick = generateSample(selectedKick, kickSampleDir);
    snare = generateSample(selectedSnare, snareSampleDir);
    hat = generateSample(selectedHat, hatSampleDir);
    
    kickMidi = kickMidis[getRandomInt(4)];
    hatMidi = hatMidis[getRandomInt(4)];

    document.getElementById('kick-midi-download').href = kickMidiDir + kickMidi;
    document.getElementById('hat-midi-download').href = hatMidiDir + hatMidi;
})

document.getElementById('play').addEventListener('click', async () => {
    await playSample(kick, kickMidiDir + kickMidi);
    await playSample(snare, snareMidiDir + snareMidi);
    await playSample(hat, hatMidiDir + hatMidi);

    console.log('Playing ' + kickMidi + ' and ' + hatMidi +'.');
});
