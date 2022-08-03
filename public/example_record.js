




let connection = null;
let isJoined = false;
let room = null;

let localTracks = [];
const remoteTracks = {};
const remoteTracksSilentParty = {};

let recorder= null
let recorderPost= []


// let stream_of_remote = "remote 12121"

/**
 * Handles local tracks.
 * @param tracks Array with JitsiTrack objects
 */
function onLocalTracks(tracks) {
    localTracks = tracks;
    for (let i = 0; i < localTracks.length; i++) {
        localTracks[i].addEventListener(
            JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
            audioLevel => console.log(`Audio Level local: ${audioLevel}`));
        localTracks[i].addEventListener(
            JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
            () => console.log('local track muted'));
        localTracks[i].addEventListener(
            JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
            () => console.log('local track stoped'));
        localTracks[i].addEventListener(
            JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
            deviceId =>
                console.log(
                    `track audio output device was changed to ${deviceId}`));
        if (localTracks[i].getType() === 'video') {
            $('body').append(`<video autoplay='1' id='localVideo${i}' />`);
            localTracks[i].attach($(`#localVideo${i}`)[0]);
        } else {
            $('body').append(
                `<audio autoplay='1' muted='true' id='localAudio${i}' />`);
            localTracks[i].attach($(`#localAudio${i}`)[0]);
        }
        if (isJoined) {
            room.addTrack(localTracks[i]);
        }
    }
}

/**
 * Handles remote tracks
 * @param track JitsiTrack object
 */
function onRemoteTrack(track) {
    if (track.isLocal()) {
        return;
    }
    const participant = track.getParticipantId();

    if (!remoteTracks[participant]) {
        remoteTracks[participant] = [];
    }
    const idx = remoteTracks[participant].push(track);

    if (!remoteTracksSilentParty[participant]) {
        remoteTracksSilentParty[participant] = [];
    }
    remoteTracksSilentParty[participant].push(track);


    track.addEventListener(
        JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
        audioLevel => console.log(`Audio Level remote: ${audioLevel}`));
    track.addEventListener(
        JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
        () => console.log('remote track muted'));
    track.addEventListener(
        JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
        () => console.log('remote track stoped'));
    track.addEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
        deviceId =>
            console.log(
                `track audio output device was changed to ${deviceId}`));
    const id = participant + track.getType() + idx;

    if (track.getType() === 'video') {
        $('body').append(
            // `<video autoplay='1' id='${participant}video${idx}' />`);
            `<audio autoplay='1' id='${participant}audio${idx}' />`);

    } else {
        $('body').append(
            `<audio autoplay='1' id='${participant}audio${idx}' />`);
    }
    track.attach($(`#${id}`)[0]);
}


async function startRecordingWithoutLocal() {
    const audioContext = new AudioContext();
    dest = audioContext.createMediaStreamDestination();
    
    // remote tracks gives remote user MediaStreams and MediaTrackStream (.stream and .track)
    console.error("tracksCaptureLogs >> remoteTracks ",remoteTracks)
    let remoteUserId=Object.keys(remoteTracks) 
    for (let i = 0; i < remoteUserId.length; i++) {
        const element = remoteUserId[i]; 
        let userAudioTracks=remoteTracks[element] // single user audio tracks
        console.error("tracksCaptureLogs >> userAudioTracks ", userAudioTracks)
        for (let y = 0; y < userAudioTracks.length; y++) {
            const element_1 = userAudioTracks[y];
            const intMediaStream=new MediaStream()
            intMediaStream.addTrack(element_1.track) // Single MediaTrackStream 
            audioContext.createMediaStreamSource(intMediaStream).connect(dest);   
        }
    }
    var FinalStream = dest.stream;
    recorder= RecordRTC(FinalStream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType:StereoAudioRecorder
    })
    recorder.startRecording();
}


async function startRecordingWithSilentParty() {
    const audioContext = new AudioContext();
    dest = audioContext.createMediaStreamDestination();
    // remote tracks gives remote user MediaStreams and MediaTrackStream (.stream and .track)
    console.error("tracksCaptureLogs >> remoteTracks ",remoteTracksSilentParty)
    let remoteUserId=Object.keys(remoteTracksSilentParty) 
    for (let i = 0; i < remoteUserId.length; i++) {
        const element = remoteUserId[i]; 
        let userAudioTracks=remoteTracksSilentParty[element] // single user audio tracks
        console.error("tracksCaptureLogs >> userAudioTracks ", userAudioTracks)
        for (let y = 0; y < userAudioTracks.length; y++) {
            const element_1 = userAudioTracks[y];
            const intMediaStream=new MediaStream()
            intMediaStream.addTrack(element_1.track) // Single MediaTrackStream 
            audioContext.createMediaStreamSource(intMediaStream).connect(dest);   
        }
    }
    var FinalStream = dest.stream;
    recorder= RecordRTC(FinalStream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType:StereoAudioRecorder
    })
    recorder.startRecording();
}

async function startRecordingWithLocal() {
    const audioContext = new AudioContext();
    dest = audioContext.createMediaStreamDestination();
    // remote tracks gives remote user MediaStreams and MediaTrackStream (.stream and .track)
    console.error("tracksCaptureLogs >> remoteTracks ",remoteTracks)
    console.error("tracksCaptureLogs >> localTracks ",localTracks)
    let remoteUserId=Object.keys(remoteTracks) 
    for (let i = 0; i < remoteUserId.length; i++) {
        const element = remoteUserId[i]; 
        let userAudioTracks=remoteTracks[element] // single user audio tracks
        console.error("tracksCaptureLogs >> userAudioTracks ", userAudioTracks)
        for (let y = 0; y < userAudioTracks.length; y++) {
            const element_1 = userAudioTracks[y];
            const intMediaStream=new MediaStream()
            intMediaStream.addTrack(element_1.track) // Single MediaTrackStream 
            audioContext.createMediaStreamSource(intMediaStream).connect(dest);   
        }
    }
    for (let index = 0; index < localTracks.length; index++) {
        const element_local = localTracks[index];
        const intMediaStream=new MediaStream()
        intMediaStream.addTrack(element_local.track) // local single MediaTrackStream 
        audioContext.createMediaStreamSource(intMediaStream).connect(dest);   
    }
    
    var FinalStream = dest.stream;
    recorder= RecordRTC(FinalStream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType:StereoAudioRecorder
    })
    recorder.startRecording();
}

async function stopRecording() {
recorder.stopRecording(function() {
    let blob = recorder.getBlob();
    invokeSaveAsDialog(blob);})
}

/**
 * That function is executed when the conference is joined
 */
function onConferenceJoined() {
    console.log('conference joined!');
    isJoined = true;
    for (let i = 0; i < localTracks.length; i++) {
        room.addTrack(localTracks[i]);
    }
}

/**
 *
 * @param id
 */
function onUserLeft(id) {
    console.log('user left');
    if (!remoteTracks[id]) {
        return;
    }
    const tracks = remoteTracks[id];

    for (let i = 0; i < tracks.length; i++) {
        tracks[i].detach($(`#${id}${tracks[i].getType()}`));
    }
}

/**
 * That function is called when connection is established successfully
 */
function onConnectionSuccess(roomId,displayName,password) {
    console.error('Connection Success!');
    const confOptions = {
        startVideoMuted:true,
        startAudioMuted:false
    };
    room = connection.initJitsiConference(roomId, confOptions);
    room.setDisplayName(displayName)
    room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
    room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, track => {
        console.log(`track removed!!!${track}`);
    });
    room.on(
        JitsiMeetJS.events.conference.CONFERENCE_JOINED,
        onConferenceJoined);
    room.on(JitsiMeetJS.events.conference.USER_JOINED, id => {
        console.log('user join');
        remoteTracks[id] = [];
    });
    room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
    room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, track => {
        console.log(`${track.getType()} - ${track.isMuted()}`);
    });
    room.on(
        JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
        (userID, displayName) => console.log(`${userID} - ${displayName}`));
    room.on(
        JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
        (userID, audioLevel) => console.log(`${userID} - ${audioLevel}`));
    room.on(
        JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED,
        () => console.log(`${room.getPhoneNumber()} - ${room.getPhonePin()}`));
    password? room.lock(password) : //..
    password? room.join(password) :room.join()
}

function silentPartyJoin(password) {
    console.error('Connection Success!');
    // let room = JitsiConference();
    room.setDisplayName("Silent Recorder")
    password? room.join(password) :room.join()
}

/**
 * This function is called when the connection fail.
 */
function onConnectionFailed() {
    console.error('Connection Failed!');
}

/**
 * This function is called when the connection fail.
 */
function onDeviceListChanged(devices) {
    console.info('current devices', devices);
}

/**
 * This function is called when we disconnect.
 */
function disconnect() {
    console.log('disconnect!');
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
        onConnectionSuccess);
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_FAILED,
        onConnectionFailed);
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
        disconnect);
}

/**
 *
 */
function unload() {
    for (let i = 0; i < localTracks.length; i++) {
        localTracks[i].dispose();
    }
    if(room){
    room.leave();
    connection.disconnect();}

}

let isVideo = false;

/**
 *
 */
function switchVideo() { // eslint-disable-line no-unused-vars
    isVideo = !isVideo;
    if (localTracks[1]) {
        localTracks[1].dispose();
        localTracks.pop();
    }
    JitsiMeetJS.createLocalTracks({
        devices: [ isVideo ? 'video' : 'desktop' ]
    })
        .then(tracks => {
            localTracks.push(tracks[0]);
            localTracks[1].addEventListener(
                JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
                () => console.log('local track muted'));
            localTracks[1].addEventListener(
                JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
                () => console.log('local track stoped'));
            localTracks[1].attach($('#localVideo1')[0]);
            room.addTrack(localTracks[1]);
        })
        .catch(error => console.log(error));
}

/**
 *
 * @param selected
 */
function changeAudioOutput(selected) { // eslint-disable-line no-unused-vars
    JitsiMeetJS.mediaDevices.setAudioOutputDevice(selected.value);
}

$(window).bind('beforeunload', unload);
$(window).bind('unload', unload);

// JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);



function startACall(roomId,displayName,options){

    const initOptions = {
        disableAudioLevels: true
    };   

    JitsiMeetJS.init(initOptions);

    connection = new JitsiMeetJS.JitsiConnection(null, null, options);
    
    connection.addEventListener(
        JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
        function(){onConnectionSuccess(roomId,displayName)});
    connection.addEventListener(
        JitsiMeetJS.events.connection.CONNECTION_FAILED,
        onConnectionFailed);
    connection.addEventListener(
        JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
        disconnect);
    
    JitsiMeetJS.mediaDevices.addEventListener(
        JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
        onDeviceListChanged);
    
    connection.connect();
    
    JitsiMeetJS.createLocalTracks({ devices: [ 'audio' ] })
        .then(onLocalTracks)
        .catch(error => {
            throw error;
        });
    
    if (JitsiMeetJS.mediaDevices.isDeviceChangeAvailable('output')) {
        JitsiMeetJS.mediaDevices.enumerateDevices(devices => {
            const audioOutputDevices
                = devices.filter(d => d.kind === 'audiooutput');
    
            if (audioOutputDevices.length > 1) {
                $('#audioOutputSelect').html(
                    audioOutputDevices
                        .map(
                            d =>
                                `<option value="${d.deviceId}">${d.label}</option>`)
                        .join('\n'));
    
                $('#audioOutputSelectWrapper').show();
            }
        });
    }
}
