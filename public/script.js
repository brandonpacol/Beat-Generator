const APIController = (function() {
    
    // private variables
    let midiArray, outputMidi, kick, snare, hat;
    let partArray = [];

    /**
    * @param {Sampler} sampler
    * @param {String} drum
    */
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

    /**
    * @param {String} drum
    * @return {Sampler}
    */
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

    /**
    * @param {Array.Midi} newMidiArray
    */
    const _setMidiArray = (newMidiArray) => {
        midiArray = newMidiArray;
    }

    /**
    * @return {Array.Midi}
    */
    const _getMidiArray = () => {
        return midiArray;
    }

    /**
    * @param {Midi} midi
    */
    const _setOutputMidi = (midi) => {
        outputMidi = midi;
    }

    /**
    * @return {Midi}
    */
    const _getOutputMidi = () => {
        return outputMidi;
    }

    /**
    * @param {Array.Part} newPartArray
    */
    const _setPartArray = (newPartArray) => {
        partArray = newPartArray;
    }

    /**
    * @return {Array.Part}
    */
    const _getPartArray = () => {
        return partArray;
    }

    /**
    * @param {String} drum
    * @param {String} bpm
    * @return {JSON} contains MIDI data
    */
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

    /**
    * @param {String} drum
    * @param {String} filename
    * @return {String} location of the sample
    */
    const _getSampleFile = (drum, filename) => {
        return '/media/samples/' + drum + '/' + filename;
    }

    /**
    * @param {String} drum
    * @return {JSON} list of samples of the specific drum library
    */
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

    return {
        setSampler(sampler, drum) {
            return _setSampler(sampler, drum)
        },
        getSampler(drum) {
            return _getSampler(drum);
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
        setPartArray(newPartArray) {
            return _setPartArray(newPartArray);
        },
        getPartArray() {
            return _getPartArray();
        },
        getMidi(drum, bpm) {
            return _getMidi(drum, bpm);
        },
        getSampleFile(drum, filename) {
            return _getSampleFile(drum, filename);
        },
        getSampleList(drum) {
            return _getSampleList(drum);
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
        stop: '#stop',
        formSelect: '#options',
        kickFile: '#kick-file',
        snareFile: '#snare-file',
        hatFile: '#hat-file',
        kickDrop: '#kick-drop',
        snareDrop: '#snare-drop',
        hatDrop: '#hat-drop',
        bpmSelect: '#bpm-select',
        bpmChange: '#bpm-change',
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
                stop: document.querySelector(DOMElements.stop),
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
                bpmChange: document.querySelector(DOMElements.bpmChange),
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
    /**
    * @param {String} filename
    * @return {Sampler}
    */
    const generateSample = (filename) => {
        const sampler = new Tone.Sampler({
            urls: {
                C3: filename,
            },
            // baseUrl: directory
        }).toDestination();
    
        return sampler;
    }
    
    /**
    * @param {Array.Midi} midiArray
    * @return {Midi} consolidated MIDI data
    */
    const generateMidi = async (midiArray) => {
        // write to midi
        let writtenMidi = new Midi();
        for (let i = 0; i < midiArray.length; i++) {
            const midi = midiArray[i];
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
    
    /**
    * @param {Array.Sampler} sampleArray
    * @param {Midi} midi
    * @param {String} bpm
    */
    const setParts = (sampleArray, midi, bpm) => {
        let partArray = APICtrl.getPartArray();

        Tone.Transport.bpm.value = bpm;
        
        const synth = new Tone.Synth().toDestination();

        for (let i = 0; i < sampleArray.length; i++) {
            let finalnotes = [];
            const notes = midi.tracks[i].notes
            notes.forEach(note => {
                let time = Tone.Time(note.time).toBarsBeatsSixteenths();
                finalnotes.push([time, 'C3']);
            })
            const part = new Tone.Part(((time, note) => {
                // the value is an object which contains both the note and the velocity
                sampleArray[i].triggerAttackRelease(note, "16n", time);
            }), finalnotes).start(0);
            if (document.querySelectorAll('.mute')[i].classList.contains('btn-secondary')) {
                part.mute = true;
            }
            part.loop = true;
            part.loopEnd = '2m';
            partArray.push(part);
        }

        APICtrl.setPartArray(partArray);
    }
    
    let lockArray = [false, false, false];
    const generateBeat = async () => {    
        let bpm = DOMInputs.bpmSelect.value;

        let kickMidi;
        if (!lockArray[0]) {
            let kickMidiData = await APICtrl.getMidi('kicks', bpm);
            kickMidi = new Midi(kickMidiData.midi.data);
        } else {
            kickMidi = APICtrl.getMidiArray()[0];
        }

        let snareMidi;
        if (!lockArray[1]) {
            let snareMidiData = await APICtrl.getMidi('snares', bpm);        
            snareMidi = new Midi(snareMidiData.midi.data);
        } else {
            snareMidi = APICtrl.getMidiArray()[1];
        }

        let hatMidi;
        if (!lockArray[2]) {
            let hatMidiData = await APICtrl.getMidi('hats', bpm);
            hatMidi = new Midi(hatMidiData.midi.data);
        } else {
            hatMidi = APICtrl.getMidiArray()[2];
        }

        let midiArray = [kickMidi, snareMidi, hatMidi];
        APICtrl.setMidiArray(midiArray);
        let outputMidi = await generateMidi(midiArray);
        APICtrl.setOutputMidi(outputMidi);

        let kickBlob = new Blob([kickMidi.toArray().buffer], { type: 'audio/midi'});
        let snareBlob = new Blob([snareMidi.toArray().buffer], { type: 'audio/midi'});
        let hatBlob = new Blob([hatMidi.toArray().buffer], { type: 'audio/midi'});
        let allBlob = new Blob([outputMidi.toArray().buffer], { type: 'audio/midi'});

        DOMInputs.kickMidiDownload.href = window.URL.createObjectURL(kickBlob);
        DOMInputs.snareMidiDownload.href = window.URL.createObjectURL(snareBlob);
        DOMInputs.hatMidiDownload.href = window.URL.createObjectURL(hatBlob);
        DOMInputs.allMidiDownload.href = window.URL.createObjectURL(allBlob);
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

        $('[data-toggle="tooltip"]').tooltip();
    }
    
    // DOM functions
    // document.querySelectorAll('.download').forEach((element) => {
    //     console.log($('#' + element.id));
    // })


    document.querySelectorAll('.lock').forEach((element, index) => {
        element.addEventListener('click', () => {
            if (lockArray[index] === false) {
                lockArray[index]= true;
                element.classList.remove('btn-outline-secondary');
                element.classList.add('btn-secondary');
                element.innerHTML = '<i class="fa-solid fa-lock"></i>'
            } else {
                lockArray[index] = false;
                element.classList.remove('btn-secondary');
                element.classList.add('btn-outline-secondary');
                element.innerHTML = '<i class="fa-solid fa-unlock"></i>'
            }
            console.log(element.id + " is locked: " + lockArray[index]);
        })
    })

    document.querySelectorAll('.mute').forEach((element, index) => {
        element.addEventListener('click', () => {
            let part = APICtrl.getPartArray()[index];
            if (part !== undefined && part.length > 0) {
                if (!part.mute) {
                    part.mute = true;
                } else {
                    part.mute = false;
                }
            }

            if (element.classList.contains('btn-outline-secondary')) {
                element.classList.remove('btn-outline-secondary');
                element.classList.add('btn-secondary');
                element.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            } else {
                element.classList.remove('btn-secondary');
                element.classList.add('btn-outline-secondary');
                element.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            }
        })
    })

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

    DOMInputs.bpmChange.addEventListener('change', () => {
        let bpmChange = parseInt(DOMInputs.bpmChange.value);
        let length = DOMInputs.bpmSelect.options.length;
        for (let i = 0; i<length; i++) {
            DOMInputs.bpmSelect.options[i].textContent = parseInt(DOMInputs.bpmSelect.options[i].value) + bpmChange;
        }
    })
    
    DOMInputs.play.addEventListener('click', () => {
        let kick = APICtrl.getSampler('kick');
        let snare = APICtrl.getSampler('snare');
        let hat = APICtrl.getSampler('hat');
        let sampleArray = [kick, snare, hat];
        if (kick !== undefined && snare !== undefined && hat !== undefined) {
            let bpm = DOMInputs.bpmSelect.value;
            let outputMidi = APICtrl.getOutputMidi();
            setParts(sampleArray, outputMidi, bpm);
            let bpmChange = DOMInputs.bpmChange.value;
            let totalBpm = parseInt(bpm) + parseInt(bpmChange);
            console.log('total bpm is ' + totalBpm)
            Tone.Transport.bpm.value = totalBpm;
            Tone.Transport.start();
            let midiArray = APICtrl.getMidiArray();
            console.log('Playing ' + midiArray[0] + ' and ' + midiArray[2] +'.');
            DOMInputs.play.disabled = true;
            DOMInputs.stop.disabled = false;
        } else {
            alert('Load Custom Samples!');
        }
    });

    DOMInputs.stop.addEventListener('click', () => {
        Tone.Transport.stop();
        let partArray = APICtrl.getPartArray();
        partArray.forEach((part) => {
            part.dispose();
        })
        APICtrl.setPartArray([]);
        DOMInputs.play.disabled = false;
        DOMInputs.stop.disabled = true;
    })
    
    DOMInputs.formSelect.addEventListener('change', (event) => {
        if (event.target.value != 'custom') {
            $('#' + event.target.id).next().addClass('faded');
        } else {
            $('#' + event.target.id).next().removeClass('faded');
        }
    })

    // https://stackoverflow.com/questions/49032616/filereader-returning-undefined-for-file-object-in-jquery
    /**
    * @param {File} file
    */
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
            let list = new DataTransfer();
            list.items.add(file);
            let myFileList = list.files;
            area.querySelector('input').files = myFileList;
            await uploadSample(area, file);
        })

        area.querySelector('input').addEventListener('change', async () => {
            const file = area.querySelector('input').files[0];
            await uploadSample(area, file);
        })

        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.remove('bg-light');
            area.classList.add('bg-primary');
        })

        area.addEventListener('dragleave', (e) => {
            e.preventDefault();
            area.classList.remove('bg-primary');
            area.classList.add('bg-light');
        })
    })

    /**
    * @param {Element} area 
    * @param {File} file
    */
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
