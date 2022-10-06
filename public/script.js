const APIController = (function() {
    
    // private variables
    let midiArray, outputMidi, kick, snare, hat;

    // private methods
    const _setKickSampler = (kickSampler) => {
        kick = kickSampler;
    }

    const _getKickSampler = () => {
        return kick;
    }

    const _setSnareSampler = (snareSampler) => {
        snare = snareSampler;
    }

    const _getSnareSampler = () => {
        return snare;
    }

    const _setHatSampler = (hatSampler) => {
        hat = hatSampler;
    }

    const _getHatSampler = () => {
        return hat;
    }

    const _setMidiArray = (newMidiArray) => {
        midiArray = newMidiArray;
    }

    const _getMidiArray = () => {
        return midiArray;
    }

    const _setOutputMidi = (midi) => {
        outputMidi = midi;
    }

    const _getOutputMidi = () => {
        return outputMidi;
    }

    return {
        setKickSampler(kickSampler) {
            return _setKickSampler(kickSampler);
        },
        getKickSampler() {
            return _getKickSampler();
        },
        setSnareSampler(snareSampler) {
            return _setSnareSampler(snareSampler);
        },
        getSnareSampler() {
            return _getSnareSampler();
        },
        setHatSampler(hatSampler) {
            return _setHatSampler(hatSampler);
        },
        getHatSampler() {
            return _getHatSampler();
        },
        setMidiArray(newMidiArray) {
            return _setMidiArray(newMidiArray);
        },
        getMidiArray() {
            return _getMidiArray();
        },
        setOutputMidi(midi) {
            return _setOutputMidi(midi);
        },
        getOutputMidi() {
            return _getOutputMidi();
        }
    }
})();


// UI Module
const UIController = (function() {

    //object to hold references to html selectors
    const DOMElements = {
        kickMidiDownload: '#kick-midi-download',
        snareMidiDownload: '#snare-midi-download',
        hatMidiDownload: '#hat-midi-download',
        kicks: '#kicks',
        snares: '#snares',
        hats: '#hats',
        generateBeat: '#generate-beat',
        setSamples: '#set-samples',
        play: '#play'
    }

    //public methods
    return {
        //method to get input fields
        inputField() {
            return {
                kickMidiDownload : document.querySelector(DOMElements.kickMidiDownload),
                snareMidiDownload: document.querySelector(DOMElements.snareMidiDownload),
                hatMidiDownload: document.querySelector(DOMElements.hatMidiDownload),
                kicks: document.querySelector(DOMElements.kicks),
                snares: document.querySelector(DOMElements.snares),
                hats: document.querySelector(DOMElements.hats),
                generateBeat: document.querySelector(DOMElements.generateBeat),
                setSamples: document.querySelector(DOMElements.setSamples),
                play: document.querySelector(DOMElements.play)
            }
        }
    }

})();

const APPController = (function(UICtrl, APICtrl) {

    // get input field object ref
    const DOMInputs = UICtrl.inputField();
    
    // tone js functions
    const generateSample = (filename, directory) => {
        const sampler = new Tone.Sampler({
            urls: {
                C3: filename,
            },
            baseUrl: directory
        }).toDestination();
    
        return sampler;
    }
    
    const generateMidi = async (midiArray) => {
        // write to midi
        var writtenMidi = new Midi();
        for (let i = 0; i < midiArray.length; i++) {
            const midi = await Midi.fromUrl(midiArray[i]);
            const track = writtenMidi.addTrack()
            midi.tracks[0].notes.forEach((note) => {
                track.addNote(({
                    name : note.name,
                    duration : note.duration,
                    time : note.time,
                    velocity : note.velocity
                }))
            });
        } 
        return writtenMidi
    }
    
    const playSample = async (sampleArray, midi) => {
        
        for (let i = 0; i < sampleArray.length; i++) {
            // load a midi file in the browser
            // const midi = await Midi.fromUrl(outputMidi);
    
            const now = Tone.now() + 0.5;
    
            midi.tracks[i].notes.forEach((note) => {
                sampleArray[i].triggerAttackRelease(
                    note.name,
                    note.duration,
                    note.time + now,
                    note.velocity
                );
            });
        }
    }
    
    // generated beat functions
    const getRandomInt = (max) => {
        return Math.floor(Math.random() * max);
    }

    const generateBeat = async () => {
        var kickMidiDir = 'midis/kicks/';
        var snareMidiDir = 'midis/snares/';
        var hatMidiDir = 'midis/hats/';
        
        var kickMidis = ['kick1.midi', 'kick2.midi', 'kick3.midi', 'kick4.midi'];
        var hatMidis = ['hat1.midi', 'hat2.midi', 'hat3.midi', 'hat4.midi'];
        
        var kickMidi = kickMidis[getRandomInt(4)];
        var snareMidi = 'snare.midi'
        var hatMidi = hatMidis[getRandomInt(4)]; 
    
        var kickMidiFile = kickMidiDir + kickMidi;
        var snareMidiFile = snareMidiDir + snareMidi;
        var hatMidiFile = hatMidiDir + hatMidi;
    
        var midiArray = [kickMidiFile, snareMidiFile, hatMidiFile];
        APICtrl.setMidiArray(midiArray);
        var outputMidi = await generateMidi(midiArray);
        APICtrl.setOutputMidi(outputMidi);
        console.log('output midi: ' + outputMidi.tracks);
    
        DOMInputs.kickMidiDownload.href = kickMidiFile;
        DOMInputs.snareMidiDownload.href = snareMidiFile;
        DOMInputs.hatMidiDownload.href = hatMidiFile;
    }

    const setSamples = () => {
        var kickSampleDir = 'samples/kicks/';
        var snareSampleDir = 'samples/snares/';
        var hatSampleDir = 'samples/hats/';

        let selectedKick = DOMInputs.kicks.value + '.wav';
        let selectedSnare = DOMInputs.snares.value + '.wav';
        let selectedHat = DOMInputs.hats.value + '.wav';
    
        var kick = generateSample(selectedKick, kickSampleDir);
        var snare = generateSample(selectedSnare, snareSampleDir);
        var hat = generateSample(selectedHat, hatSampleDir);

        APICtrl.setKickSampler(kick);
        APICtrl.setSnareSampler(snare);
        APICtrl.setHatSampler(hat);
    }

    const loadinitialPage = async () => {
        generateBeat();
        setSamples();
    }
    
    // dom functions
    DOMInputs.generateBeat.addEventListener('click', async () => {
        generateBeat();
    })
    
    DOMInputs.setSamples.addEventListener('click', () => {
        setSamples();
    });  
    
    DOMInputs.play.addEventListener('click', async () => {
        let outputMidi = APICtrl.getOutputMidi();
        let kick = APICtrl.getKickSampler();
        let snare = APICtrl.getSnareSampler();
        let hat = APICtrl.getHatSampler();
        let sampleArray = [kick, snare, hat];
        await playSample(sampleArray, outputMidi);
        let midiArray = APICtrl.getMidiArray();
        console.log('Playing ' + midiArray[0] + ' and ' + midiArray[2] +'.');
    });
    
    return {
        init() {
            loadinitialPage();
        }
    }

})(UIController, APIController);

APPController.init();
