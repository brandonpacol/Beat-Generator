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

    const _getMidi = async (drum) => {
        const result = await fetch('/getMidi', {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              drum : drum
            })});
        const data = await result.json();
        return data;
    }

    const _getSampleFile = (drum, filename) => {
        return '/media/samples/' + drum + '/' + filename;
    }

    const _getSampleList = async (drum) => {
        const result = await fetch('/getSamples', {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              drum : drum
            })});
        const data = await result.json();
        return data;       
    }

    const _getCustomSample = (filename) => {
        return '/uploads/' + filename; 
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
        },
        getMidi(drum) {
            return _getMidi(drum);
        },
        getSampleFile(drum, filename) {
            return _getSampleFile(drum, filename);
        },
        getSampleList(drum) {
            return _getSampleList(drum);
        },
        getCustomSample(filename) {
            return _getCustomSample(filename);
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
        play: '#play',
        formSelect: '#options',
        kickUpload: '#kick-upload',
        kickFile: '#kick-file',
        snareUpload: '#snare-upload',
        snareFile: '#snare-file',
        hatUpload: '#hat-upload',
        hatFile: '#hat-file'
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
                play: document.querySelector(DOMElements.play),
                formSelect: document.querySelector(DOMElements.formSelect),
                kickUpload: document.querySelector(DOMElements.kickUpload),
                kickFile: document.querySelector(DOMElements.kickFile),
                snareUpload: document.querySelector(DOMElements.snareUpload),
                snareFile: document.querySelector(DOMElements.snareFile),
                hatUpload: document.querySelector(DOMElements.hatUpload),
                hatFile: document.querySelector(DOMElements.hatFile)
            }
        },

        changeDownload(domElement, midiFile) {
            domElement.href = midiFile;
        },

        getSampleInput(domElement) {
            return domElement.value;
        },

        createListOptions(domElement, filename, label) {
            const html = `<option value="${filename}">${label}</option>`
            domElement.insertAdjacentHTML('beforeend', html);
        },

        disableUpload(domElement) {
            domElement.disabled = true;
        },

        enableUpload(domElement) {
            domElement.disabled = false;
        }
        
    }

})();

const APPController = (function(UICtrl, APICtrl) {

    // get input field object ref
    const DOMInputs = UICtrl.inputField();
    
    // tone js functions
    const generateSample = (filename) => {
        const sampler = new Tone.Sampler({
            urls: {
                C3: filename,
            },
            // baseUrl: directory
        }).toDestination();
    
        return sampler;
    }
    
    const generateMidi = async (midiArray) => {
        // write to midi
        let writtenMidi = new Midi();
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
        let kickMidiFile = await APICtrl.getMidi('kicks');
        let snareMidiFile = await APICtrl.getMidi('snares');
        let hatMidiFile = await APICtrl.getMidi('hats');

        kickMidiFile = kickMidiFile.midi;
        snareMidiFile = snareMidiFile.midi;
        hatMidiFile = hatMidiFile.midi;

        let midiArray = [kickMidiFile, snareMidiFile, hatMidiFile];
        APICtrl.setMidiArray(midiArray);
        let outputMidi = await generateMidi(midiArray);
        APICtrl.setOutputMidi(outputMidi);
        console.log('output midi: ' + outputMidi.tracks);
    
        UICtrl.changeDownload(DOMInputs.kickMidiDownload, kickMidiFile);
        UICtrl.changeDownload(DOMInputs.snareMidiDownload, snareMidiFile);
        UICtrl.changeDownload(DOMInputs.hatMidiDownload, hatMidiFile);
    }

    const setSamples = () => {
        let selectedKick = UICtrl.getSampleInput(DOMInputs.kicks);
        let selectedSnare = UICtrl.getSampleInput(DOMInputs.snares);
        let selectedHat = UICtrl.getSampleInput(DOMInputs.hats);

        let kickFile;
        if (selectedKick == 'custom') {
            selectedKick = DOMInputs.kickFile.files[0].name;
            kickFile = APICtrl.getCustomSample(selectedKick);
        } else {
            kickFile = APICtrl.getSampleFile('kicks', selectedKick);
        }


        let snareFile
        if (selectedSnare == 'custom') {
            selectedSnare = DOMInputs.snareFile.files[0].name;
            snareFile = APICtrl.getCustomSample(selectedSnare);
        } else {
            snareFile = APICtrl.getSampleFile('snares', selectedSnare);
        }


        let hatFile;
        if (selectedHat == 'custom') {
            selectedHat = DOMInputs.hatFile.files[0].name;
            hatFile = APICtrl.getCustomSample(selectedHat);
        } else {
            hatFile = APICtrl.getSampleFile('hats', selectedHat);
        }
    
        let kick = generateSample(kickFile);
        let snare = generateSample(snareFile);
        let hat = generateSample(hatFile);

        APICtrl.setKickSampler(kick);
        APICtrl.setSnareSampler(snare);
        APICtrl.setHatSampler(hat);
    }

    const loadinitialPage = async () => {
        let kickSamples = await APICtrl.getSampleList('kicks');
        for (let i = 0; i < kickSamples.length; i++) {
            UICtrl.createListOptions(DOMInputs.kicks, kickSamples[i], 'Kick ' + (i + 1));
        }

        let snareSamples = await APICtrl.getSampleList('snares');
        for (let i = 0; i < snareSamples.length; i++) {
            UICtrl.createListOptions(DOMInputs.snares, snareSamples[i], 'Snare ' + (i + 1));
        }

        let hatSamples = await APICtrl.getSampleList('hats');
        for (let i = 0; i < hatSamples.length; i++) {
            UICtrl.createListOptions(DOMInputs.hats, hatSamples[i], 'Hat ' + (i + 1));
        }

        await generateBeat();
        // setSamples();
    }
    
    // DOM functions
    DOMInputs.generateBeat.addEventListener('click', async () => {
        await generateBeat();
    })
    
    DOMInputs.setSamples.addEventListener('click', () => {
        setSamples();
    });

    DOMInputs.kickUpload.addEventListener('click', (e) => {
        e.preventDefault();
        const filesize = DOMInputs.kickFile.files[0].size / 1024 / 1024;
        if(filesize > 1) {
            alert('File exceeds 1MB.');
        } else {
            var xhttp = new XMLHttpRequest();
    
            xhttp.open("POST", "kickUpload")
            var formData = new FormData()
            formData.append('kick', DOMInputs.kickFile.files[0]);
            xhttp.send(formData)
        }
    })

    DOMInputs.kickFile.addEventListener('change', () => {
        if (DOMInputs.kickFile.files.length > 0) {
            DOMInputs.kickUpload.disabled = false;
        }
    })

    DOMInputs.snareUpload.addEventListener('click', (e) => {
        e.preventDefault();
        const filesize = DOMInputs.snareFile.files[0].size / 1024 / 1024;
        if(filesize > 1) {
            alert('File exceeds 1MB.');
        } else {
            var xhttp = new XMLHttpRequest();

            xhttp.open("POST", "snareUpload")
            var formData = new FormData()
            formData.append('snare', DOMInputs.snareFile.files[0]);
            xhttp.send(formData)
        }
    })

    DOMInputs.snareFile.addEventListener('change', () => {
        if (DOMInputs.snareFile.files.length > 0) {
            DOMInputs.snareUpload.disabled = false;
        }
    })

    DOMInputs.hatUpload.addEventListener('click', (e) => {
        e.preventDefault();
        const filesize = DOMInputs.hatFile.files[0].size / 1024 / 1024;
        if(filesize > 1) {
            alert('File exceeds 1MB.');
        } else {
            var xhttp = new XMLHttpRequest();

            xhttp.open("POST", "hatUpload")
            var formData = new FormData()
            formData.append('hat', DOMInputs.hatFile.files[0]);
            xhttp.send(formData)
        }
    })

    DOMInputs.hatFile.addEventListener('change', () => {
        if (DOMInputs.hatFile.files.length > 0) {
            DOMInputs.hatUpload.disabled = false;
        }
    })
    
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
    
    DOMInputs.formSelect.addEventListener('change', (event) => {
        if (event.target.value != 'custom') {
            if ($('#' + event.target.id).next().attr('class') == 'file-upload-form') {
                $('#' + event.target.id).next().children()[0].disabled = true;
                $('#' + event.target.id).next().children()[1].disabled = true;
            }
        } else {
            $('#' + event.target.id).next().children()[0].disabled = false;
        }
    })

    return {
        init() {
            loadinitialPage();
        }
    }

})(UIController, APIController);

APPController.init();
