import './App.css';
import { useEffect, useState } from 'react';
import MultiStreamRecorder, {MediaStreamRecorder, invokeSaveAsDialog, StereoAudioRecorder, WebAssemblyRecorder } from "recordrtc"
import useScript from './scriptHandler';

function App() {

  const [apis,setApis]=useState(undefined)
  const [recorder,setRecorder]=useState(undefined)
  const [loader,setLoader]=useState(true)
  const [roomId,setRoomId]=useState(undefined)
  const [meetingLink,setMeetingLink]=useState(undefined)
  const [displayName,setDisplayName]=useState(undefined)
  const [remoteAudioTrack,setRemoteAudioTracks]=useState(undefined)
  const [participantsModerator,setParticipantsModerator]=useState(undefined)
  const [recUserID,setRecUserId]=useState(undefined)
  const [participantsRecorder,setParticipantsRecorder]=useState(undefined)
  const [options,setOptions] = useState({
    hosts: {
        domain: 'meet.jit.si',
        muc: 'conference.meet.jit.si', 
        focus: 'focus.meet.jit.si',
     }, 
     externalConnectUrl: 'https://meet.jit.si/http-pre-bind', 
     enableP2P: true, 
     p2p: { 
        enabled: true, 
        preferH264: true, 
        disableH264: true, 
        useStunTurn: true,
     }, 
     useStunTurn: true, 
     bosh: `https://meet.jit.si/http-bind?room=liveroom`, 
     websocket: 'wss://meet.jit.si/xmpp-websocket', 
     clientNode: 'http://jitsi.org/jitsimeet', 
    
});
  useEffect(()=>{
  const scriptToAdd=[
    "https://www.webrtc-experiment.com/MultiStreamsMixer.js",
    "https://www.WebRTC-Experiment.com/RecordRTC.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js",
    "https://code.jquery.com/jquery-3.5.1.min.js",
    "https://meet.jit.si/libs/lib-jitsi-meet.min.js",
    "example_user_join.js"
  ]

    for (let index = 0; index < scriptToAdd.length; index++) {
      const url = scriptToAdd[index];
      const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload=function (params) {
      
    }
      document.body.appendChild(script);
    }
    
    setLoader(false)
  },[])
  
  const getMeetingLink = () =>{
    
    return `https://${options?.hosts?.domain}/${roomId}`
  }

useEffect(()=>{
  console.log(roomId)
  console.log(`https://${options?.hosts?.domain}/${roomId}`)
  setMeetingLink(`https://${options?.hosts?.domain}/${roomId}`)
},[roomId])



useEffect(()=>{
  console.error("remoteAudioTrack>>>",remoteAudioTrack)
},[remoteAudioTrack])
useEffect(()=>{
  console.error("participatesRecorder>>>",participantsRecorder)
},[participantsRecorder])
useEffect(()=>{
  console.error("participatesModerator>>>",participantsModerator)
},[participantsModerator])
useEffect(()=>{
  console.error("rec user id>>>",recUserID)
},[recUserID])
  return (

    
    
    <div className="App">
        {/* eslint-disable-next-line */}
        {/* <a href="#" onClick={()=>{window.unload()}}>Unload</a> */}
        {/* eslint-disable-next-line */}
        {/* <a href="#" onClick={()=>{window.switchVideo()}}>switchVideo</a> */}
    <div id="audioOutputSelectWrapper" style={{display:"none"}}>
        Change audio output device
        {/* eslint-disable-next-line */}
        <select id="audioOutputSelect" onChange={(e)=>window.changeAudioOutput(e)}></select>
    </div>
      

{/* <button onClick={()=>{console.log("rec"); recorder.startRecording()}}>Start Rec </button>
<button onClick={()=>{console.log("stop rec");recorder.stopRecording(function() {
          let blob = recorder.getBlob();
          invokeSaveAsDialog(blob);
      });
    }}>Stop  Rec </button> */}
{/* <button onClick={()=>{console.log("clicked getMeetingLink",window.startACall(roomId,options))}}>Start Meeting </button>
<div><a href={meetingLink} target="_blank">{meetingLink}</a></div> */}



<div class="container mt-4">
        <div class="row">
            <div class="col-md-6 col-12">

                <input type="text" class="mt-4 mb-4" placeholder='Enter Room Id' value={roomId} onChange={(e)=>setRoomId(e.target.value)}/> <br/>
                <input type="text" class="mt-4 mb-4" placeholder='Enter Name' value={displayName} onChange={(e)=>setDisplayName(e.target.value)}/> <br/>
                {roomId && displayName ? <button type="button" onClick={()=>window.startACall(roomId,displayName,options)} class="btn btn-primary mt-4 mb-4"  >Start A Call</button> :<></>}
                {roomId && displayName ?<button type="button" class="btn btn-danger mt-4 mb-4" onClick={()=>{window.unload()}} >Leave Call</button> :<></>} <br/>
                {roomId && displayName ? <button type="button" class="btn btn-primary mt-4 mb-4"onClick={()=>{window.silentPartyJoin(roomId,"silent Rec",options)}} >Add Silent Recorder</button> :<></>}
                {roomId && displayName ? <button type="button" class="btn btn-danger mt-4 mb-4" onClick={()=>{window.unload_silence()}} >Leave Silent Call</button>:<></>} <br/>

                {roomId && displayName ? <button type="button" class="btn btn-primary mt-4 mb-4" onClick={() => {navigator.clipboard.writeText(meetingLink)}}>Copy Meeting Link</button> :<></>}<br/>
            </div>
            <div class="col-md-6 col-12">
                <button type="button" class="btn btn-primary mt-4 mb-4" onClick={()=>{window.startRecordingWithoutLocal()}} >Start Recording Without local</button>
                <button type="button" class="btn btn-danger mt-4 mb-4" onClick={()=>{window.pauseRecordingWithoutLocal()}} >P</button> 
                <button type="button" class="btn btn-danger mt-4 mb-4" onClick={()=>{window.resumeRecordingWithoutLocal()}} >R</button> 
                <button type="button" class="btn btn-danger mt-4 mb-4" onClick={()=>{window.stopRecordingWithOutLocal()}} >Stop</button> 
                <br/>
                 <br/>
                <button type="button" class="btn btn-primary mt-4 mb-4" onClick={()=>{window.startRecordingWithLocal()}} >Start Recording With Local</button>
                <button type="button" class="btn btn-danger mt-4 mb-4" onClick={()=>{window.pauseRecordingWithLocal()}} >P</button>
                <button type="button" class="btn btn-danger mt-4 mb-4" onClick={()=>{window.resumeRecordingWithLocal()}} >R</button>
                <button type="button" class="btn btn-danger mt-4 mb-4" onClick={()=>{window.stopRecordingWithLocal()}} >Stop</button>
                 <br/>
                 <br/>
                <button type="button" class="btn btn-primary mt-4 mb-4" onClick={()=>{window.startRecordingWithSilentParty()}} >Start Recording With Silent Party</button>
                <button type="button" class="btn btn-danger mt-4 mb-4" onClick={()=>{window.pauseRecordingWithSilentParty()}} >P</button>
                <button type="button" class="btn btn-danger mt-4 mb-4" onClick={()=>{window.resumeRecordingWithSilentParty()}} >R</button>
                <button type="button" class="btn btn-danger mt-4 mb-4" onClick={()=>{window.stopRecordingWithSilentParty()}} >Stop</button>
                 <br/>
                 <br/>
                 <p>to record custom tracks use userIds separated by , and send l to record local track</p>
                 <input type="text" class="mt-4 mb-4" placeholder='Enter user id ' value={recUserID} onChange={(e)=>setRecUserId(e.target.value)}/>
                 <button type="button" class="btn btn-primary mt-4 mb-4" onClick={()=>{window.startCustomRecording(recUserID)}} >Start Custom Rec</button>
                <button type="button" class="btn btn-danger mt-4 mb-4" onClick={()=>{window.pauseRecordingCustom()}} >P</button>
                <button type="button" class="btn btn-danger mt-4 mb-4" onClick={()=>{window.resumeRecordingCustom()}} >R</button>
                <button type="button" class="btn btn-danger mt-4 mb-4" onClick={()=>{window.stopRecordingCustom()}} >Stop</button>
                 <br/>
                 <br/>
                {/* <button type="button" class="btn btn-primary mt-4 mb-4" onClick={()=>{setRemoteAudioTracks(window.getRemoteTracks())}} >get Remote Tracks</button> <br/> */}
                <button type="button" class="btn btn-primary mt-4 mb-4" onClick={()=>{setParticipantsModerator(window.remoteUsersList())}} >Remote participants for moderator</button> <br/>
                <button type="button" class="btn btn-primary mt-4 mb-4" onClick={()=>{setParticipantsRecorder(window.remoteUsersListSilentRec())}} >Remote participants for silent recorder</button> <br/>
                </div>
        </div>
    </div>

    <div class="row">
            <div class="col-md-6 col-6">
              <p>Remote participants for moderator</p>
            {participantsModerator?.map((p)=>{
              return <li>{p._displayName}-{p._id}</li>
            })}
            </div>
            <div class="col-md-6 col-6">
            <p>Remote participants for silent recorder</p>

            {participantsRecorder?.map((p)=>{
              return <li>{p._displayName}-{p._id}</li>
            })}
            </div>
    </div>
         
    </div>
  );
}

export default App;
