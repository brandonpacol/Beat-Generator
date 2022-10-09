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
        kicks: '#kicks',
        snares: '#snares',
        hats: '#hats',
        generateBeat: '#generate-beat',
        setSamples: '#set-samples',
        play: '#play',
        formSelect: '#options',
        kickFile: '#kickUpload',
        snareFile: '#snareUpload',
        hatFile: '#hatUpload',
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
    const generateBeat = async () => {    
        let bpm = DOMInputs.bpmSelect.value;

        let kickMidiFile = await APICtrl.getMidi('kicks', bpm);
        let snareMidiFile = await APICtrl.getMidi('snares', bpm);
        let hatMidiFile = await APICtrl.getMidi('hats', bpm);

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
        select.addEventListener('change', () => {
            let selectedSample = select.value;
            let drum = select.name;
            let input = select.parentElement.querySelector('input');
            let sampleFile;
            if (selectedSample == 'custom') {
                if (input.files.length > 0) {
                    console.log(`custom ${drum} is loaded`);
                    selectedSample = input.files[0].name;
                    sampleFile = APICtrl.getCustomSample(selectedSample);
                }
            } else {
                sampleFile = APICtrl.getSampleFile(drum, selectedSample);
            }
            let sample = generateSample(sampleFile);
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

    DOMInputs.dropArea.forEach((area) => {
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            console.log('file dropped');
            area.classList.remove('bg-primary');
            if (area.querySelector('p')) {
                area.querySelector('p').remove();
            }

            const file = e.dataTransfer.files[0];
            let list = new DataTransfer();
            list.items.add(file);
            let myFileList = list.files;

            let input = area.querySelector('input');
            input.files = myFileList;
            console.log(input.files);
            area.querySelector('h5').textContent = file.name;

            const filesize = input.files[0].size / 1024 / 1024;
            const call = input.id;
            const drum = input.getAttribute('drum');

            if(filesize > 1) {
                alert('File exceeds 1MB.');
            } else {
                var xhttp = new XMLHttpRequest();
        
                xhttp.open('POST', call)
                var formData = new FormData()
                formData.append(drum, input.files[0]);
                xhttp.send(formData);
                setTimeout(function(){
                    let name = input.files[0].name;
                    let sampleFile = APICtrl.getCustomSample(name);
                    let sample = generateSample(sampleFile);
                    APICtrl.setSampler(sample, drum);
                }, 1000)
            }
        })

        area.addEventListener('click', () => {
            area.querySelector("input").click();
        })

        area.querySelector('input').addEventListener('change', () => {
            let input = area.querySelector('input');
            area.querySelector('h5').textContent = input.files[0].name;

            const filesize = input.files[0].size / 1024 / 1024;
            const call = input.id;
            const drum = input.getAttribute('drum');

            if(filesize > 1) {
                alert('File exceeds 1MB.');
            } else {
                var xhttp = new XMLHttpRequest();
        
                xhttp.open('POST', call)
                var formData = new FormData()
                formData.append(drum, input.files[0]);
                xhttp.send(formData);
                setTimeout(function(){
                    let name = input.files[0].name;
                    let sampleFile = APICtrl.getCustomSample(name);
                    let sample = generateSample(sampleFile);
                    APICtrl.setSampler(sample, drum);
                }, 1000)
            }
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

    return {
        init() {
            loadinitialPage();
        }
    }

})(UIController, APIController);

APPController.init();
