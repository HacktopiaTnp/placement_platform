"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import { Mic, StopCircle, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";

const VideoRecorder = ({ onVideoSubmit, isLoading }) => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [timer, setTimer] = useState(0);
  const [videoBlob, setVideoBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [realtimeTranscript, setRealtimeTranscript] = useState("");

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      // Request high-quality audio and video
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 1280, 
          height: 720,
          facingMode: "user"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000, // High quality audio sampling
          channelCount: 1 // Mono for voice
        },
      });

      // Initialize Web Speech API for real-time transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        let transcript = '';
        
        recognitionRef.current.onresult = (event) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptPiece = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              transcript += transcriptPiece + ' ';
              setRealtimeTranscript(transcript.trim());
              console.log('🎤 Transcribed:', transcriptPiece);
            }
          }
        };
        
        recognitionRef.current.onerror = (event) => {
          if (event.error !== 'no-speech') {
            console.error('Speech recognition error:', event.error);
          }
        };
        
        try {
          recognitionRef.current.start();
          console.log('🎤 Real-time transcription started');
        } catch (e) {
          console.warn('Could not start speech recognition:', e);
        }
      }

      // Use webm with VP9 for video and Opus for audio (better quality)
      let options = { 
        mimeType: "video/webm;codecs=vp9,opus",
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000 // High quality audio bitrate
      };
      
      // Fallback if VP9+Opus not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = {
          mimeType: "video/webm",
          audioBitsPerSecond: 128000
        };
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);

      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          console.log('📦 Recorded chunk:', event.data.size, 'bytes');
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        console.log('🎬 Final video blob size:', blob.size, 'bytes');
        setVideoBlob(blob);
        
        // Create preview URL
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        
        // Stop speech recognition
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
            console.log('🛑 Real-time transcription stopped');
          } catch (e) {
            console.log('Recognition already stopped');
          }
        }
        
        toast.success("Recording saved! Transcription complete.");
      };

      mediaRecorderRef.current.start(100); // Capture in 100ms chunks for better audio continuity
      setIsRecording(true);
      setTimer(0);
      setRecordedChunks([]);
      
      toast("🎙️ Recording started - Speak clearly into your microphone");
      console.log('🎤 Audio settings:', stream.getAudioTracks()[0].getSettings());
    } catch (error) {
      console.error("Error accessing camera/microphone:", error);
      toast.error("Camera or microphone access denied. Please enable permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast("Recording stopped - Processing...");
    }
  };

  const handleSubmit = () => {
    if (!videoBlob) {
      toast("Please record a video first");
      return;
    }

    if (timer < 20) {
      toast("Video should be at least 20 seconds long");
      return;
    }

    console.log('📤 Submitting video with real-time transcript');
    console.log('📝 Transcript:', realtimeTranscript.substring(0, 100) + '...');
    console.log('📏 Transcript length:', realtimeTranscript.length, 'characters');
    
    onVideoSubmit(videoBlob, timer, realtimeTranscript);
  };

  const retakeVideo = () => {
    setVideoBlob(null);
    setPreviewUrl(null);
    setTimer(0);
    setRealtimeTranscript("");
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Camera View */}
      <div className="relative w-full bg-black rounded-lg overflow-hidden">
        {!videoBlob ? (
          <>
            <Webcam
              ref={webcamRef}
              mirrored
              className="w-full aspect-video object-cover"
              screenshotFormat="image/jpeg"
            />
            {isRecording && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Recording {formatTime(timer)}
              </div>
            )}
          </>
        ) : (
          <video
            src={previewUrl}
            controls
            className="w-full aspect-video object-cover"
          />
        )}
      </div>

      {/* Tips */}
      <div className="w-full bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-sm">
        <p className="font-semibold mb-2">📋 Interview Tips:</p>
        <ul className="space-y-1 text-xs">
          <li>✓ Make direct eye contact with the camera</li>
          <li>✓ Sit upright with good posture</li>
          <li>✓ Speak clearly and confidently</li>
          <li>✓ Use hand gestures naturally</li>
          <li>✓ Keep answer 1-3 minutes long</li>
        </ul>
      </div>

      {/* Controls */}
      <div className="flex gap-3 w-full">
        {!videoBlob ? (
          <>
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                <Video className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Stop Recording ({formatTime(timer)})
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              onClick={retakeVideo}
              variant="outline"
              className="flex-1"
              disabled={isLoading}
            >
              Retake Video
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Analyzing..." : "Submit Answer"}
            </Button>
          </>
        )}
      </div>

      {videoBlob && (
        <div className="w-full text-xs text-gray-500 text-center">
          Video Duration: {formatTime(timer)} • Size: {(videoBlob.size / 1024 / 1024).toFixed(2)} MB
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
