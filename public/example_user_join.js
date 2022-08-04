let connection = null;
let connection_silent = null;
let isJoined = false;
let room = null;
let room_silent = null;
let localTracks = [];
const remoteTracks = {};
const remoteTracksSilentParty = {};
let recorder_withLocal = null;
let recorder_withSilentParty = null;
let recorder_withOutLocal = null;
let recorder_custom = null;
let recorder_all = {};
function onLocalTracks(tracks) {
  localTracks = tracks;
  for (let i = 0; i < localTracks.length; i++) {
    localTracks[i].addEventListener(
      JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
      (audioLevel) => console.log(`Audio Level local: ${audioLevel}`)
    );
    localTracks[i].addEventListener(
      JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
      () => console.log("local track muted")
    );
    localTracks[i].addEventListener(
      JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
      () => console.log("local track stoped")
    );
    localTracks[i].addEventListener(
      JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
      (deviceId) =>
        console.log(`track audio output device was changed to ${deviceId}`)
    );
    if (localTracks[i].getType() === "video") {
      $("body").append(`<video autoplay='1' id='localVideo${i}' />`);
      localTracks[i].attach($(`#localVideo${i}`)[0]);
    } else {
      $("body").append(
        `<audio autoplay='1' muted='true' id='localAudio${i}' />`
      );
      localTracks[i].attach($(`#localAudio${i}`)[0]);
    }
    if (isJoined) {
      room.addTrack(localTracks[i]);
    }
  }
}
function onRemoteTrack(track) {
  if (track.isLocal()) {
    return;
  }
  const participant = track.getParticipantId();
  if (!remoteTracks[participant]) {
    remoteTracks[participant] = [];
  }
  const idx = remoteTracks[participant].push(track);
  track.addEventListener(
    JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
    (audioLevel) => console.log(`Audio Level remote: ${audioLevel}`)
  );
  track.addEventListener(JitsiMeetJS.events.track.TRACK_MUTE_CHANGED, () =>
    console.log("remote track muted")
  );
  track.addEventListener(JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED, () =>
    console.log("remote track stoped")
  );
  track.addEventListener(
    JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
    (deviceId) =>
      console.log(`track audio output device was changed to ${deviceId}`)
  );
  const id = participant + track.getType() + idx;
  if (track.getType() === "video") {
    $("body").append(
      `<audio autoplay='1' id='${participant}audio${idx}' />`
    );
  } else {
    $("body").append(`<audio autoplay='1' id='${participant}audio${idx}' />`);
  }
  track.attach($(`#${id}`)[0]);
}
function onRemoteTrackSilentRec(track) {
  if (track.isLocal()) {
    return;
  }
  const participant = track.getParticipantId();
  if (!remoteTracksSilentParty[participant]) {
    remoteTracksSilentParty[participant] = [];
  }
  remoteTracksSilentParty[participant].push(track);
}
async function startRecordingWithoutLocal() {
  const audioContext = new AudioContext();
  dest = audioContext.createMediaStreamDestination();
  let remoteUserId = Object.keys(remoteTracks);
  for (let i = 0; i < remoteUserId.length; i++) {
    const element = remoteUserId[i];
    let userAudioTracks = remoteTracks[element]; // single user audio tracks
    for (let y = 0; y < userAudioTracks.length; y++) {
      const element_1 = userAudioTracks[y];
      const intMediaStream = new MediaStream();
      intMediaStream.addTrack(element_1.track); // Single MediaTrackStream
      audioContext.createMediaStreamSource(intMediaStream).connect(dest);
    }
  }
  var FinalStream = dest.stream;
  recorder_withOutLocal = RecordRTC(FinalStream, {
    type: "audio",
    mimeType: "audio/wav",
    recorderType: StereoAudioRecorder,
  });
  recorder_withOutLocal.startRecording();
}
async function startRecordingWithSilentParty() {
  const audioContext = new AudioContext();
  dest = audioContext.createMediaStreamDestination();
  let remoteUserId = Object.keys(remoteTracksSilentParty);
  for (let i = 0; i < remoteUserId.length; i++) {
    const element = remoteUserId[i];
    let userAudioTracks = remoteTracksSilentParty[element]; // single user audio tracks
    for (let y = 0; y < userAudioTracks.length; y++) {
      const element_1 = userAudioTracks[y];
      const intMediaStream = new MediaStream();
      intMediaStream.addTrack(element_1.track); // Single MediaTrackStream
      audioContext.createMediaStreamSource(intMediaStream).connect(dest);
    }
  }
  var FinalStream = dest.stream;
  recorder_withSilentParty = RecordRTC(FinalStream, {
    type: "audio",
    mimeType: "audio/wav",
    recorderType: StereoAudioRecorder,
  });
  recorder_withSilentParty.startRecording();
}
async function startRecordingWithLocal() {
  const audioContext = new AudioContext();
  dest = audioContext.createMediaStreamDestination();
  let remoteUserId = Object.keys(remoteTracks);
  for (let i = 0; i < remoteUserId.length; i++) {
    const element = remoteUserId[i];
    let userAudioTracks = remoteTracks[element]; // single user audio tracks
    for (let y = 0; y < userAudioTracks.length; y++) {
      const element_1 = userAudioTracks[y];
      const intMediaStream = new MediaStream();
      intMediaStream.addTrack(element_1.track); // Single MediaTrackStream
      audioContext.createMediaStreamSource(intMediaStream).connect(dest);
    }
  }
  for (let index = 0; index < localTracks.length; index++) {
    const element_local = localTracks[index];
    const intMediaStream = new MediaStream();
    intMediaStream.addTrack(element_local.track); // local single MediaTrackStream
    audioContext.createMediaStreamSource(intMediaStream).connect(dest);
  }
  var FinalStream = dest.stream;
  recorder_withLocal = RecordRTC(FinalStream, {
    type: "audio",
    mimeType: "audio/wav",
    recorderType: StereoAudioRecorder,
  });
  recorder_withLocal.startRecording();
}
async function startCustomRecording(ids) {
  const audioContext = new AudioContext();
  dest = audioContext.createMediaStreamDestination();
  let recordingInstructions = ids.split(",");
  let remoteUserId = [];
  let remoteUserId_ = Object.keys(remoteTracks);
  let remoteUserIdSil_ = Object.keys(remoteTracksSilentParty);
  for (let index = 0; index < remoteUserId_.length; index++) {
    const elementOne = remoteUserId_[index];
    if (remoteUserId.indexOf(elementOne) < 0) {
      remoteUserId.push(elementOne);
    }
  }
  for (let index = 0; index < remoteUserIdSil_.length; index++) {
    const elementTwo = remoteUserIdSil_[index];
    if (remoteUserId.indexOf(elementTwo) < 0) {
      remoteUserId.push(elementTwo);
    }
  }
  for (let i = 0; i < remoteUserId.length; i++) {
    const element = remoteUserId[i];
    if (recordingInstructions.indexOf(element) > -1) {
      let userAudioTracks = null;
      if (remoteTracks[element]) {
        userAudioTracks = remoteTracks[element];
      }
      if (remoteTracksSilentParty[element]) {
        userAudioTracks = remoteTracksSilentParty[element];
      }
      for (let y = 0; y < userAudioTracks.length; y++) {
        const element_1 = userAudioTracks[y];
        const intMediaStream = new MediaStream();
        intMediaStream.addTrack(element_1.track); // Single MediaTrackStream
        audioContext.createMediaStreamSource(intMediaStream).connect(dest);
      }
    }
  }
  if (recordingInstructions.indexOf("l") > -1) {
    for (let index = 0; index < localTracks.length; index++) {
      const element_local = localTracks[index];
      const intMediaStream = new MediaStream();
      intMediaStream.addTrack(element_local.track); // local single MediaTrackStream
      audioContext.createMediaStreamSource(intMediaStream).connect(dest);
    }
  }
  var FinalStream = dest.stream;
  recorder_custom = RecordRTC(FinalStream, {
    type: "audio",
    mimeType: "audio/wav",
    recorderType: StereoAudioRecorder,
  });
  recorder_custom.startRecording();
}
async function startIndividualRecording(ids) {
  let local=false
  if(ids==="local"){
    local=true
  }
  const audioContext = new AudioContext();
  dest = audioContext.createMediaStreamDestination();
  let recordingInstructions = ids.split(",");
  let remoteUserId = [];
  let remoteUserId_ = Object.keys(remoteTracks); // interchange if required to take silent rec as priority
  let remoteUserIdSil_ = Object.keys(remoteTracksSilentParty);
  for (let index = 0; index < remoteUserId_.length; index++) {
    const elementOne = remoteUserId_[index];
    if (remoteUserId.indexOf(elementOne) < 0) {
      remoteUserId.push(elementOne);
    }
  }
  for (let index = 0; index < remoteUserIdSil_.length; index++) {
    const elementTwo = remoteUserIdSil_[index];
    if (remoteUserId.indexOf(elementTwo) < 0) {
      remoteUserId.push(elementTwo);
    }
  }
  for (let i = 0; i < remoteUserId.length; i++) {
    const element = remoteUserId[i];
    if (recordingInstructions.indexOf(element) > -1) {
      let userAudioTracks = null;
      if (remoteTracks[element]) {
        userAudioTracks = remoteTracks[element];
      }
      if (remoteTracksSilentParty[element]) {
        userAudioTracks = remoteTracksSilentParty[element];
      }
      for (let y = 0; y < userAudioTracks.length; y++) {
        const element_1 = userAudioTracks[y];
        const intMediaStream = new MediaStream();
        intMediaStream.addTrack(element_1.track); // Single MediaTrackStream
        audioContext.createMediaStreamSource(intMediaStream).connect(dest);
      }
    }
  }
  if (local) {
    for (let index = 0; index < localTracks.length; index++) {
      const element_local = localTracks[index];
      const intMediaStream = new MediaStream();
      intMediaStream.addTrack(element_local.track);
      audioContext.createMediaStreamSource(intMediaStream).connect(dest);
    }
  }
  var FinalStream = dest.stream;
  // recorder_all={}
  recorder_all[ids] = RecordRTC(FinalStream, {
    type: "audio",
    mimeType: "audio/wav",
    recorderType: StereoAudioRecorder,
  });
  recorder_all[ids].startRecording();
}
async function pauseRecordingWithoutLocal() {
  recorder_withOutLocal.pauseRecording();
}
async function resumeRecordingWithoutLocal() {
  recorder_withOutLocal.resumeRecording();
}
async function pauseRecordingWithLocal() {
  recorder_withLocal.pauseRecording();
}
async function resumeRecordingWithLocal() {
  recorder_withLocal.resumeRecording();
}
async function pauseRecordingWithSilentParty() {
  recorder_withSilentParty.pauseRecording();
}
async function resumeRecordingWithSilentParty() {
  recorder_withSilentParty.resumeRecording();
}
async function pauseRecordingCustom() {
  recorder_custom.pauseRecording();
}
async function resumeRecordingCustom() {
  recorder_custom.resumeRecording();
}
async function stopRecordingWithOutLocal(name) {
  recorder_withOutLocal.stopRecording(function () {
    let blob = recorder_withOutLocal.getBlob();
    invokeSaveAsDialog(blob, `${name}.wav`);
    recorder_withOutLocal = null;
  });
}
async function stopRecordingWithSilentParty(name) {
  recorder_withSilentParty.stopRecording(function () {
    let blob = recorder_withSilentParty.getBlob();
    invokeSaveAsDialog(blob, `${name}.wav`);
    recorder_withSilentParty = null;
  });
}
async function stopRecordingWithLocal(name) {
  recorder_withLocal.stopRecording(function () {
    let blob = recorder_withLocal.getBlob();
    invokeSaveAsDialog(blob, `${name}.wav`);
    recorder_withLocal = null;
  });
}
async function stopRecordingCustom(name) {
  recorder_custom.stopRecording(function () {
    let blob = recorder_custom.getBlob();
    invokeSaveAsDialog(blob, `${name}.wav`);
    recorder_custom = null;
  });
}
async function stopIndividualRecording(id, name) {
  recorder_all[id].stopRecording(function () {
    let blob = recorder_all[id].getBlob();
    invokeSaveAsDialog(blob, `${name}_${id}.wav`);
    recorder_all[id] = null;
  });
}
async function pauseIndividualRecording(id) {
  recorder_all[id].pauseRecording();
}
async function resumeIndividualRecording(id) {
  recorder_all[id].resumeRecording();
}
function onConferenceJoined() {
  console.log("conference joined!");
  isJoined = true;
  for (let i = 0; i < localTracks.length; i++) {
    room.addTrack(localTracks[i]);
  }
}
function onUserLeft(id) {
  console.log("user left");
  if (!remoteTracks[id]) {
    return;
  }
  const tracks = remoteTracks[id];
  for (let i = 0; i < tracks.length; i++) {
    tracks[i].detach($(`#${id}${tracks[i].getType()}`));
  }
}
function onConnectionSuccess(roomId, displayName, password) {
  console.error("Connection Success MODERATOR!");
  const confOptions = {
    startVideoMuted: true,
    startAudioMuted: false,
  };
  room = connection.initJitsiConference(roomId, confOptions);
  room.setDisplayName(displayName);
  room.setStartMutedPolicy({ video: true });
  room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
  room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, (track) => {
    console.log(`track removed!!!${track}`);
  });
  room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, onConferenceJoined);
  room.on(JitsiMeetJS.events.conference.USER_JOINED, (id) => {
    console.log("user join");
    remoteTracks[id] = [];
  });
  room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
  room.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, (track) => {
    console.log(`${track.getType()} - ${track.isMuted()}`);
  });
  room.on(
    JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
    (userID, displayName) => console.log(`${userID} - ${displayName}`)
  );
  room.on(
    JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
    (userID, audioLevel) => console.log(`${userID} - ${audioLevel}`)
  );
  room.on(JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED, () =>
    console.log(`${room.getPhoneNumber()} - ${room.getPhonePin()}`)
  );
  password
    ? room.lock(password) //..
    : password
    ? room.join(password)
    : room.join();
}
function silentPartyCallJoin(roomId, displayName, password) {
  console.error("Connection Success SILENT REC!");
  const confOptions = {
    startVideoMuted: true,
    startAudioMuted: true,
  };
  room_silent = connection_silent.initJitsiConference(roomId, confOptions);
  room_silent.setDisplayName("Silent Rec");
  room_silent.setStartMutedPolicy({ video: true, audio: true });
  room_silent.on(
    JitsiMeetJS.events.conference.TRACK_ADDED,
    onRemoteTrackSilentRec
  );
  room_silent.on(JitsiMeetJS.events.conference.USER_JOINED, (id) => {
    console.log("user join silent");
    remoteTracksSilentParty[id] = [];
  });
  password
    ? room_silent.lock(password) //..
    : password
    ? room_silent.join(password)
    : room_silent.join();
}
function onConnectionFailed() {
  console.error("Connection Failed!");
}
function onDeviceListChanged(devices) {
  console.info("current devices", devices);
}
function disconnect() {
  console.log("disconnect!");
  connection.removeEventListener(
    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
    onConnectionSuccess
  );
  connection.removeEventListener(
    JitsiMeetJS.events.connection.CONNECTION_FAILED,
    onConnectionFailed
  );
  connection.removeEventListener(
    JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
    disconnect
  );
}
function disconnect_silent() {
  console.log("disconnect!");
  connection_silent.removeEventListener(
    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
    onConnectionSuccess
  );
  connection_silent.removeEventListener(
    JitsiMeetJS.events.connection.CONNECTION_FAILED,
    onConnectionFailed
  );
  connection_silent.removeEventListener(
    JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
    disconnect
  );
}
function unload() {
  for (let i = 0; i < localTracks.length; i++) {
    localTracks[i].dispose();
  }
  if (room) {
    room.leave();
    connection.disconnect();
    connection = null;
  }
}
function unload_silence() {
  for (let i = 0; i < localTracks.length; i++) {
    localTracks[i].dispose();
  }
  if (room) {
    room.leave();
    connection_silent.disconnect();
    connection_silent = null;
  }
}
let isVideo = false;
function switchVideo() {
  // eslint-disable-line no-unused-vars
  isVideo = !isVideo;
  if (localTracks[1]) {
    localTracks[1].dispose();
    localTracks.pop();
  }
  JitsiMeetJS.createLocalTracks({
    devices: [isVideo ? "video" : "desktop"],
  })
    .then((tracks) => {
      localTracks.push(tracks[0]);
      localTracks[1].addEventListener(
        JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
        () => console.log("local track muted")
      );
      localTracks[1].addEventListener(
        JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
        () => console.log("local track stoped")
      );
      localTracks[1].attach($("#localVideo1")[0]);
      room.addTrack(localTracks[1]);
    })
    .catch((error) => console.log(error));
}
function changeAudioOutput(selected) {
  JitsiMeetJS.mediaDevices.setAudioOutputDevice(selected.value);
}
$(window).bind("beforeunload", unload);
$(window).bind("unload", unload);
// JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
function startACall(roomId, displayName, options) {
  if (!connection) {
    const initOptions = {
      disableAudioLevels: true,
    };
    JitsiMeetJS.init(initOptions);
    connection = new JitsiMeetJS.JitsiConnection(null, null, options);
    connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      function () {
        onConnectionSuccess(roomId, displayName);
      }
    );
    connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_FAILED,
      onConnectionFailed
    );
    connection.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
      disconnect
    );
    JitsiMeetJS.mediaDevices.addEventListener(
      JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
      onDeviceListChanged
    );
    connection.connect();
    JitsiMeetJS.createLocalTracks({ devices: ["audio"] })
      .then(onLocalTracks)
      .catch((error) => {
        throw error;
      });
    if (JitsiMeetJS.mediaDevices.isDeviceChangeAvailable("output")) {
      JitsiMeetJS.mediaDevices.enumerateDevices((devices) => {
        const audioOutputDevices = devices.filter(
          (d) => d.kind === "audiooutput"
        );
        if (audioOutputDevices.length > 1) {
          $("#audioOutputSelect").html(
            audioOutputDevices
              .map((d) => `<option value="${d.deviceId}">${d.label}</option>`)
              .join("\n")
          );
          $("#audioOutputSelectWrapper").show();
        }
      });
    }
  }
}
function silentPartyJoin(roomId, displayName, options) {
  if (!connection_silent) {
    connection_silent = new JitsiMeetJS.JitsiConnection(null, null, options);
    connection_silent.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
      function () {
        silentPartyCallJoin(roomId, displayName);
      }
    );
    connection_silent.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_FAILED,
      onConnectionFailed
    );
    connection_silent.addEventListener(
      JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
      disconnect_silent
    );
    connection_silent.connect();
  }
}
function getRemoteTracks() {
  return remoteTracks;
}
function remoteUsersList() {
  let userIds = Object.keys(remoteTracks);
  let participant = [];
  for (let index = 0; index < userIds.length; index++) {
    const element = userIds[index];
    let ps = room.getParticipantById(element);
    if (ps) {
      participant.push(ps);
    }
  }
  return participant;
}
function remoteUsersListSilentRec() {
  let userIds = Object.keys(remoteTracksSilentParty);
  let participant = [];
  for (let index = 0; index < userIds.length; index++) {
    const element = userIds[index];
    let ps = room_silent.getParticipantById(element);
    if (ps) {
      participant.push(ps);
    }
  }
  return participant;
}
