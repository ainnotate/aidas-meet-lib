import './App.css';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useEffect, useState } from 'react';
import MultiStreamRecorder, {MediaStreamRecorder,  StereoAudioRecorder, WebAssemblyRecorder } from "recordrtc"
import {invokeSaveAsDialog}  from 'recordrtc';
function App() {

  const [apis,setApis]=useState(undefined)
  const [recorder,setRecorder]=useState(undefined)
  
  const recorderInstance = async() =>{
    
    

    
    navigator.mediaDevices.getUserMedia({
      audio: true,
      // video:{mediaSource: "screen", width: 320, height: 200}
  }).then(async function(stream) {

      setRecorder(
        MultiStreamRecorder(stream, {
          type: 'audio',
          mimeType: 'audio/wav',
          recorderType:StereoAudioRecorder,
          numberOfAudioChannels: 1,

      }))

      // recorder.startRecording();
  
      // const sleep = m => new Promise(r => setTimeout(r, m));
      // await sleep(7000);
  
      // recorder.stopRecording(function() {
      //     let blob = recorder.getBlob();
      //     invokeSaveAsDialog(blob);
      // });
  });


  }
  

  useEffect(()=>{
    if(apis){
      recorderInstance()
    }
  },[apis])


  return (
    <div className="App">
      
      <JitsiMeeting
        domain = { "meet.jit.si" }
        roomName = "TeceadsTesting"
        configOverwrite = {{
        startAudioOnly:true,
        disableModeratorIndicator: true,
        startScreenSharing: false,
        enableEmailInStats: false
        }}
        interfaceConfigOverwrite = {{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
        }}
        userInfo = {{
            displayName: 'REC.'
        }}
        onApiReady = { async(externalApi) => {

        // here you can attach custom event listeners to the Jitsi Meet External API
        // you can also store it locally to execute commands
          setApis(externalApi)



        }}
        getIFrameRef = {(node)=> {node.style.height = '800px'} }
      />

<button onClick={()=>{console.log("rec"); recorder.startRecording()}}>Start Rec </button>
<button onClick={()=>{console.log("stop rec");recorder.stopRecording(function() {
          let blob = recorder.getBlob();
          invokeSaveAsDialog(blob);
      });
    }}>Stop  Rec </button>


<button onClick={()=>{console.log("clicked MediaStream",MediaStream.getAudioTracks()); recorder.startRecording()}}>test  </button>



    </div>
    
  );
}

export default App;
