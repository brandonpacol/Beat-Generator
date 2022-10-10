const APIController = (function() {
    
    // private variables
    let midiArray, outputMidi, kick, snare, hat;

    // private methods
    const _setSampler = (sampler, drum) => {
        switch(drum) {
            case 'kick':
                kick = sampler;
                break;
            case 'snare':
                snare = sampler;
                break;
            case 'hat':
                hat = sampler;
                break;
        }
    }

    const _getSampler = (drum) => {
        switch(drum) {
            case 'kick':
                return kick;
            case 'snare':
                return snare;
            case 'hat':
                return hat;
        }
    }

    const _setMidiDataArray = (newMidiArray) => {
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

    const _getMidi = async (drum, bpm) => {
        const result = await fetch('/getMidi', {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              drum : drum,
              bpm : bpm
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
        setSampler(sampler, drum) {
            return _setSampler(sampler, drum)
        },
        getSampler(drum) {
            return _getSampler(drum);
        },
        setMidiDataArray(newMidiArray) {
            return _setMidiDataArray(newMidiArray);
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
        getMidi(drum, bpm) {
            return _getMidi(drum, bpm);
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
        allMidiDownload: '#all-midi-download',
        kicks: '#kicks',
        snares: '#snares',
        hats: '#hats',
        generateBeat: '#generate-beat',
        setSamples: '#set-samples',
        play: '#play',
        formSelect: '#options',
        kickFile: '#kick-file',
        snareFile: '#snare-file',
        hatFile: '#hat-file',
        kickDrop: '#kick-drop',
        snareDrop: '#snare-drop',
        hatDrop: '#hat-drop',
        bpmSelect: '#bpm-select',
        dropArea: '.drop-area'
    }

    //public methods
    return {
        //method to get input fields
        inputField() {
            return {
                kickMidiDownload : document.querySelector(DOMElements.kickMidiDownload),
                snareMidiDownload: document.querySelector(DOMElements.snareMidiDownload),
                hatMidiDownload: document.querySelector(DOMElements.hatMidiDownload),
                allMidiDownload: document.querySelector(DOMElements.allMidiDownload),
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
                hatFile: document.querySelector(DOMElements.hatFile),
                kickDrop: document.querySelector(DOMElements.kickDrop),
                snareDrop: document.querySelector(DOMElements.snareDrop),
                hatDrop: document.querySelector(DOMElements.hatDrop),
                bpmSelect: document.querySelector(DOMElements.bpmSelect),
                dropArea: document.querySelectorAll(DOMElements.dropArea)
            }
        },

        createListOptions(domElement, filename, label) {
            const html = `<option value="${filename}">${label}</option>`
            domElement.insertAdjacentHTML('beforeend', html);
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
    
    const generateMidi = async (midiDataArray) => {
        // write to midi
        let writtenMidi = new Midi();
        for (let i = 0; i < midiDataArray.length; i++) {
            const midi = new Midi(midiDataArray[i].data);
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
        return writtenMidi;
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
    
    const generateBeat = async () => {    
        let bpm = DOMInputs.bpmSelect.value;

        let kickMidiResult = await APICtrl.getMidi('kicks', bpm);
        let snareMidiResult = await APICtrl.getMidi('snares', bpm);
        let hatMidiResult = await APICtrl.getMidi('hats', bpm);

        let kickMidiData = kickMidiResult.midi;
        let snareMidiData = snareMidiResult.midi;
        let hatMidiData = hatMidiResult.midi;

        let midiDataArray = [kickMidiData, snareMidiData, hatMidiData];
        APICtrl.setMidiDataArray(midiDataArray);
        let outputMidi = await generateMidi(midiDataArray);
        APICtrl.setOutputMidi(outputMidi);
        console.log(outputMidi)
        console.log(outputMidi.toArray().buffer);

        let kickBlob = midiToBlob(kickMidiData.data);
        let snareBlob = midiToBlob(snareMidiData.data);
        let hatBlob = midiToBlob(hatMidiData.data)
        let allBlob = new Blob([outputMidi.toArray().buffer], { type: 'audio/midi'})
        console.log(allBlob);

        DOMInputs.kickMidiDownload.href = window.URL.createObjectURL(kickBlob);
        DOMInputs.snareMidiDownload.href = window.URL.createObjectURL(snareBlob);
        DOMInputs.hatMidiDownload.href = window.URL.createObjectURL(hatBlob);
        DOMInputs.allMidiDownload.href = window.URL.createObjectURL(allBlob);
    }

    const midiToBlob = (midiData) => {
        const data = Uint8Array.from(midiData);
        return new Blob([data.buffer], { type: 'audio/midi' });
    }

    const loadinitialPage = async () => {
        let kickSamples = await APICtrl.getSampleList('kick');
        for (let i = 0; i < kickSamples.length; i++) {
            UICtrl.createListOptions(DOMInputs.kicks, kickSamples[i], 'Kick ' + (i + 1));
        }

        let snareSamples = await APICtrl.getSampleList('snare');
        for (let i = 0; i < snareSamples.length; i++) {
            UICtrl.createListOptions(DOMInputs.snares, snareSamples[i], 'Snare ' + (i + 1));
        }

        let hatSamples = await APICtrl.getSampleList('hat');
        for (let i = 0; i < hatSamples.length; i++) {
            UICtrl.createListOptions(DOMInputs.hats, hatSamples[i], 'Hat ' + (i + 1));
        }

        await generateBeat();
    }
    
    // DOM functions
    DOMInputs.generateBeat.addEventListener('click', async () => {
        await generateBeat();
    })

    document.querySelectorAll('.drum-select').forEach((select) => {
        select.addEventListener('change', async () => {
            let selectedSample = select.value;
            let drum = select.name;
            let input = select.parentElement.querySelector('input');
            let sample;
            if (selectedSample == 'custom') {
                if (input.files.length > 0) {
                    console.log(`custom ${drum} is loaded`);
                    let file = input.files[0];
                    
                    const buffer = await readFile(file);
                    const ac = new AudioContext();
                    const audiobuffer = await ac.decodeAudioData(buffer);

                    sample = generateSample(audiobuffer);
                }
            } else {
                let sampleFile = APICtrl.getSampleFile(drum, selectedSample);
                sample = generateSample(sampleFile);
            }
            APICtrl.setSampler(sample, drum);
        })
    })
    
    DOMInputs.play.addEventListener('click', async () => {
        try {
            let outputMidi = APICtrl.getOutputMidi();
            let kick = APICtrl.getSampler('kick');
            let snare = APICtrl.getSampler('snare');
            let hat = APICtrl.getSampler('hat');
            let sampleArray = [kick, snare, hat];
            await playSample(sampleArray, outputMidi);
            let midiArray = APICtrl.getMidiArray();
            console.log('Playing ' + midiArray[0] + ' and ' + midiArray[2] +'.');
        } catch (err) {
            alert('Load Custom Samples!')
            console.log(err);
        }
    });
    
    DOMInputs.formSelect.addEventListener('change', (event) => {
        if (event.target.value != 'custom') {
            $('#' + event.target.id).next().children()[0].disabled = true
        } else {
            $('#' + event.target.id).next().children()[0].disabled = false;
        }
    })

    // https://stackoverflow.com/questions/49032616/filereader-returning-undefined-for-file-object-in-jquery
    function readFile(file){
        return new Promise((res, rej) => {
            // create file reader
            let reader = new FileReader();
            
            // register event listeners
            reader.addEventListener("loadend", e => res(e.target.result));
            reader.addEventListener("error", rej);
            
            // read file
            reader.readAsArrayBuffer(file);
        });
    }

    DOMInputs.dropArea.forEach((area) => {
        area.addEventListener('click', () => {
            area.querySelector("input").click();
        })
        
        area.addEventListener('drop', async (e) => {
            e.preventDefault();
            console.log('file dropped');
            area.classList.remove('bg-primary');

            const file = e.dataTransfer.files[0];
            await uploadSample(area, file);
        })

        area.querySelector('input').addEventListener('change', async () => {
            const file = area.querySelector('input').files[0];
            await uploadSample(area, file);
        })

        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('bg-primary');
        })

        area.addEventListener('dragleave', (e) => {
            e.preventDefault();
            area.classList.remove('bg-primary');
        })
    })

    const uploadSample = async (area, file) => {
        let input = area.querySelector('input');
        const filesize = file.size / 1024 / 1024;

        if (file.type == 'audio/wav' || file.type == 'audio/mp3') {
            if(filesize < 1) {
                const buffer = await readFile(file);
                const ac = new AudioContext();
                const audiobuffer = await ac.decodeAudioData(buffer);
                
                area.querySelector('h5').textContent = file.name;
                if (area.querySelector('p')) {
                    area.querySelector('p').remove();
                }

                const drum = input.getAttribute('drum');
                let sample = generateSample(audiobuffer);
                APICtrl.setSampler(sample, drum);
            } else {
                alert('File exceeds 1MB.');
            }
        } else {
            alert('Please upload .wav or .mp3 files.')
        }
    }

    return {
        init() {
            loadinitialPage();
        }
    }

})(UIController, APIController);

APPController.init();
