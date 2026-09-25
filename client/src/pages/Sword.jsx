import React, { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  HandLandmarker,
} from "@mediapipe/tasks-vision";

/*
==========================================================
 SWORD SYSTEM
 ---------------------------------------------------------
 Camera
   ↓
 MediaPipe Hand Tracking
   ↓
 ☝️ Pointing  → điều khiển mục tiêu
 ✋ Open      → kiếm tản ra
 ✊ Closed    → kiếm lao vào
   ↓
 Canvas
   ↓
 150 thanh kiếm
==========================================================
*/


// ========================================================
// CONFIG
// ========================================================

// Số lượng kiếm
const SWORD_COUNT = 200;

// Tốc độ bình thường
const MIN_SPEED = 1.5;
const MAX_SPEED = 8.5;

// Lực hút về mục tiêu
const MIN_FORCE = 0.15;
const MAX_FORCE = 0.4;

// Khi nắm tay, kiếm nhanh gấp bao nhiêu lần
const ATTACK_SPEED_MULTIPLIER = 3.5;

// Độ dài kiếm
const MIN_SWORD_LENGTH = 22;
const MAX_SWORD_LENGTH = 50;

// ========================================================
// MEDIAPIPE
// ========================================================

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";



// ========================================================
// MAIN COMPONENT
// ========================================================

export default function Sword() {

  // ------------------------------------------------------
  // DOM
  // ------------------------------------------------------

  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  // ------------------------------------------------------
  // MediaPipe
  // ------------------------------------------------------

  const handLandmarkerRef =
    useRef(null);

  // ------------------------------------------------------
  // Animation
  // ------------------------------------------------------

  const animationRef =
    useRef(null);

  const handDetectionRef =
    useRef(null);

  // ------------------------------------------------------
  // Camera stream
  // ------------------------------------------------------

  const streamRef =
    useRef(null);

  // ------------------------------------------------------
  // Tránh xử lý lại cùng frame
  // ------------------------------------------------------

  const lastVideoTimeRef =
    useRef(-1);

  // ------------------------------------------------------
  // Target
  // ------------------------------------------------------

  const targetRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  // ------------------------------------------------------
  // Trạng thái tay
  // ------------------------------------------------------

  const handStateRef =
    useRef("NONE");

  // ------------------------------------------------------
  // React state
  // ------------------------------------------------------

  const [handState, setHandState] =
    useState("NONE");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ======================================================
  // MAIN EFFECT
  // ======================================================

  useEffect(() => {

    let cancelled = false;

    // ====================================================
    // CANVAS
    // ====================================================

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx =
      canvas.getContext("2d");

    // ====================================================
    // SWORDS
    // ====================================================

    const swords =
      [];

    // ----------------------------------------------------
    // Tạo 150 kiếm
    // ----------------------------------------------------

    for (
      let i = 0;
      i < SWORD_COUNT;
      i++
    ) {

      const speed =
        MIN_SPEED +
        Math.random() *
          (MAX_SPEED - MIN_SPEED);

      const force =
        MIN_FORCE +
        Math.random() *
          (MAX_FORCE - MIN_FORCE);

      swords.push({

        // ------------------------------
        // Position
        // ------------------------------

        x:
          Math.random() *
          window.innerWidth,

        y:
          Math.random() *
          window.innerHeight,

        // ------------------------------
        // Velocity
        // ------------------------------

        vx: 0,
        vy: 0,

        // ------------------------------
        // Size
        // ------------------------------

        length:
          MIN_SWORD_LENGTH +
          Math.random() *
            (
              MAX_SWORD_LENGTH -
              MIN_SWORD_LENGTH
            ),

        width:
          1.5 +
          Math.random() * 2,

        // ------------------------------
        // Physics
        // ------------------------------

        speed,

        force,

        // ------------------------------
        // Rotation
        // ------------------------------

        angle:
          Math.random() *
          Math.PI *
          2,

        // ------------------------------
        // Color
        // ------------------------------

        hue:
          185 +
          Math.random() *
            55,

        // ------------------------------
        // Trail
        // ------------------------------

        previousX: 0,
        previousY: 0,

        // ------------------------------
        // Random phase
        // ------------------------------

        phase:
          Math.random() *
          Math.PI *
          2,

      });
    }


    // ====================================================
    // RESIZE
    // ====================================================

    function resize() {

      const dpr =
        Math.min(
          window.devicePixelRatio || 1,
          2
        );

      canvas.width =
        window.innerWidth *
        dpr;

      canvas.height =
        window.innerHeight *
        dpr;

      canvas.style.width =
        `${window.innerWidth}px`;

      canvas.style.height =
        `${window.innerHeight}px`;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );
    }


    // ====================================================
    // DISTANCE
    // ====================================================

    function distance(a, b) {

      const dx =
        a.x - b.x;

      const dy =
        a.y - b.y;

      return Math.sqrt(
        dx * dx +
        dy * dy
      );
    }


    // ====================================================
    // CLASSIFY HAND
    // ====================================================

    function classifyHand(
      landmarks
    ) {

      const wrist =
        landmarks[0];

      // -------------------------------
      // Index
      // -------------------------------

      const indexTip =
        landmarks[8];

      const indexPip =
        landmarks[6];

      // -------------------------------
      // Middle
      // -------------------------------

      const middleTip =
        landmarks[12];

      const middlePip =
        landmarks[10];

      // -------------------------------
      // Ring
      // -------------------------------

      const ringTip =
        landmarks[16];

      const ringPip =
        landmarks[14];

      // -------------------------------
      // Pinky
      // -------------------------------

      const pinkyTip =
        landmarks[20];

      const pinkyPip =
        landmarks[18];


      // ==================================================
      // Kiểm tra ngón duỗi
      // ==================================================

      const indexExtended =
        distance(
          indexTip,
          wrist
        ) >
        distance(
          indexPip,
          wrist
        ) * 1.12;


      const middleExtended =
        distance(
          middleTip,
          wrist
        ) >
        distance(
          middlePip,
          wrist
        ) * 1.12;


      const ringExtended =
        distance(
          ringTip,
          wrist
        ) >
        distance(
          ringPip,
          wrist
        ) * 1.12;


      const pinkyExtended =
        distance(
          pinkyTip,
          wrist
        ) >
        distance(
          pinkyPip,
          wrist
        ) * 1.12;


      // ==================================================
      // ☝️ POINTING
      // ==================================================

      if (
        indexExtended &&
        !middleExtended &&
        !ringExtended &&
        !pinkyExtended
      ) {

        return "POINTING";
      }


      // ==================================================
      // ✋ OPEN
      // ==================================================

      if (
        indexExtended &&
        middleExtended &&
        ringExtended &&
        pinkyExtended
      ) {

        return "OPEN";
      }


      // ==================================================
      // ✊ CLOSED
      // ==================================================

      if (
        !indexExtended &&
        !middleExtended &&
        !ringExtended &&
        !pinkyExtended
      ) {

        return "CLOSED";
      }


      return "NONE";
    }


    // ====================================================
    // UPDATE SWORD
    // ====================================================

    function updateSword(
      sword
    ) {

      const target =
        targetRef.current;

      const state =
        handStateRef.current;


      // --------------------------------------------------
      // Direction to target
      // --------------------------------------------------

      const dx =
        target.x -
        sword.x;

      const dy =
        target.y -
        sword.y;

      const distanceToTarget =
        Math.sqrt(
          dx * dx +
          dy * dy
        );


      if (
        distanceToTarget >
        0.1
      ) {

        const nx =
          dx /
          distanceToTarget;

        const ny =
          dy /
          distanceToTarget;


        // =================================================
        // ☝️ POINTING
        // =================================================

        if (
          state ===
          "POINTING"
        ) {

          sword.vx +=
            nx *
            sword.force;

          sword.vy +=
            ny *
            sword.force;
        }


        // =================================================
        // ✊ CLOSED
        // =================================================

        else if (
          state ===
          "CLOSED"
        ) {

          sword.vx +=
            nx *
            sword.force *
            3;

          sword.vy +=
            ny *
            sword.force *
            3;
        }


        // =================================================
        // ✋ OPEN
        // =================================================

        else if (
          state ===
          "OPEN"
        ) {

          const centerX =
            window.innerWidth /
            2;

          const centerY =
            window.innerHeight /
            2;


          const ox =
            sword.x -
            centerX;

          const oy =
            sword.y -
            centerY;


          const centerDistance =
            Math.sqrt(
              ox * ox +
              oy * oy
            ) || 1;


          sword.vx +=
            (
              ox /
              centerDistance
            ) *
            0.018;


          sword.vy +=
            (
              oy /
              centerDistance
            ) *
            0.018;
        }
      }


      // ==================================================
      // SPEED LIMIT
      // ==================================================

      let maxSpeed =
        sword.speed;


      if (
        state ===
        "CLOSED"
      ) {

        maxSpeed *=
          ATTACK_SPEED_MULTIPLIER;
      }


      const velocity =
        Math.sqrt(
          sword.vx *
            sword.vx +
          sword.vy *
            sword.vy
        );


      if (
        velocity >
        maxSpeed
      ) {

        sword.vx =
          (
            sword.vx /
            velocity
          ) *
          maxSpeed;


        sword.vy =
          (
            sword.vy /
            velocity
          ) *
          maxSpeed;
      }


      // ==================================================
      // FRICTION
      // ==================================================

      sword.vx *=
        0.985;

      sword.vy *=
        0.985;


      // ==================================================
      // POSITION
      // ==================================================

      sword.previousX =
        sword.x;

      sword.previousY =
        sword.y;


      sword.x +=
        sword.vx;

      sword.y +=
        sword.vy;


      // ==================================================
      // ROTATION
      // ==================================================

      if (
        velocity >
        0.05
      ) {

        const targetAngle =
          Math.atan2(
            sword.vy,
            sword.vx
          );


        let diff =
          targetAngle -
          sword.angle;


        while (
          diff >
          Math.PI
        ) {

          diff -=
            Math.PI * 2;
        }


        while (
          diff <
          -Math.PI
        ) {

          diff +=
            Math.PI * 2;
        }


        sword.angle +=
          diff *
          0.15;
      }


      // ==================================================
      // SCREEN WRAP
      // ==================================================

      const margin =
        100;


      if (
        sword.x <
        -margin
      ) {

        sword.x =
          window.innerWidth +
          margin;
      }


      if (
        sword.x >
        window.innerWidth +
        margin
      ) {

        sword.x =
          -margin;
      }


      if (
        sword.y <
        -margin
      ) {

        sword.y =
          window.innerHeight +
          margin;
      }


      if (
        sword.y >
        window.innerHeight +
        margin
      ) {

        sword.y =
          -margin;
      }
    }


    // ====================================================
    // DRAW TRAIL
    // ====================================================

    function drawTrail(
      sword
    ) {

      ctx.save();

      ctx.beginPath();

      ctx.moveTo(
        sword.previousX,
        sword.previousY
      );

      ctx.lineTo(
        sword.x,
        sword.y
      );


      ctx.strokeStyle =
        `hsla(
          ${sword.hue},
          100%,
          65%,
          0.18
        )`;


      ctx.lineWidth =
        sword.width * 2;


      ctx.shadowBlur =
        10;


      ctx.shadowColor =
        `hsla(
          ${sword.hue},
          100%,
          65%,
          0.8
        )`;


      ctx.stroke();

      ctx.restore();
    }


    // ====================================================
    // DRAW SWORD
    // ====================================================

    function drawSword(
      sword
    ) {

      ctx.save();


      // --------------------------------------------------
      // Position
      // --------------------------------------------------

      ctx.translate(
        sword.x,
        sword.y
      );


      // --------------------------------------------------
      // Rotation
      // --------------------------------------------------

      ctx.rotate(
        sword.angle
      );


      // --------------------------------------------------
      // Glow
      // --------------------------------------------------

      ctx.shadowBlur =
        18;

      ctx.shadowColor =
        `hsla(
          ${sword.hue},
          100%,
          65%,
          0.95
        )`;


      // ==================================================
      // BLADE
      // ==================================================

      const gradient =
        ctx.createLinearGradient(
          -sword.length / 2,
          0,
          sword.length / 2,
          0
        );


      gradient.addColorStop(
        0,
        "#ffffff"
      );


      gradient.addColorStop(
        0.25,
        "#dfffff"
      );


      gradient.addColorStop(
        0.65,
        "#42eaff"
      );


      gradient.addColorStop(
        1,
        "#007d9f"
      );


      ctx.fillStyle =
        gradient;


      ctx.beginPath();


      ctx.moveTo(
        -sword.length / 2,
        -sword.width
      );


      ctx.lineTo(
        sword.length / 2,
        0
      );


      ctx.lineTo(
        -sword.length / 2,
        sword.width
      );


      ctx.closePath();


      ctx.fill();


      // ==================================================
      // BLADE HIGHLIGHT
      // ==================================================

      ctx.strokeStyle =
        "rgba(255,255,255,0.85)";


      ctx.lineWidth =
        0.8;


      ctx.beginPath();


      ctx.moveTo(
        -sword.length / 2 + 3,
        0
      );


      ctx.lineTo(
        sword.length / 2 - 3,
        0
      );


      ctx.stroke();


      // ==================================================
      // HANDLE
      // ==================================================

      ctx.shadowBlur =
        7;


      ctx.fillStyle =
        "#d9b35d";


      ctx.fillRect(
        -sword.length / 2 - 11,
        -2,
        11,
        4
      );


      // ==================================================
      // GUARD
      // ==================================================

      ctx.strokeStyle =
        "#fff0a6";


      ctx.lineWidth =
        2;


      ctx.beginPath();


      ctx.moveTo(
        -sword.length / 2 - 2,
        -7
      );


      ctx.lineTo(
        -sword.length / 2 - 2,
        7
      );


      ctx.stroke();


      ctx.restore();
    }


    // ====================================================
    // TARGET
    // ====================================================

    function drawTarget() {

      const target =
        targetRef.current;


      ctx.save();


      // Outer glow
      ctx.shadowBlur =
        25;

      ctx.shadowColor =
        "#00eaff";


      // Circle
      ctx.beginPath();


      ctx.arc(
        target.x,
        target.y,
        18,
        0,
        Math.PI * 2
      );


      ctx.strokeStyle =
        "rgba(0,234,255,0.75)";


      ctx.lineWidth =
        2;


      ctx.stroke();


      // Crosshair
      ctx.beginPath();


      ctx.moveTo(
        target.x - 28,
        target.y
      );


      ctx.lineTo(
        target.x + 28,
        target.y
      );


      ctx.moveTo(
        target.x,
        target.y - 28
      );


      ctx.lineTo(
        target.x,
        target.y + 28
      );


      ctx.strokeStyle =
        "rgba(0,234,255,0.4)";


      ctx.lineWidth =
        1;


      ctx.stroke();


      // Center
      ctx.beginPath();


      ctx.arc(
        target.x,
        target.y,
        4,
        0,
        Math.PI * 2
      );


      ctx.fillStyle =
        "#ffffff";


      ctx.fill();


      ctx.restore();
    }


    // ====================================================
    // ANIMATION
    // ====================================================

    function animate() {

      // --------------------------------------------------
      // Background fade
      // --------------------------------------------------

      ctx.fillStyle =
        "rgba(2,6,23,0.20)";


      ctx.fillRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
      );


      // --------------------------------------------------
      // Swords
      // --------------------------------------------------

      for (
        const sword of swords
      ) {

        updateSword(
          sword
        );

        drawTrail(
          sword
        );

        drawSword(
          sword
        );
      }


      // --------------------------------------------------
      // Target
      // --------------------------------------------------

      drawTarget();


      animationRef.current =
        requestAnimationFrame(
          animate
        );
    }


    // ====================================================
    // PROCESS HAND
    // ====================================================

    function processHand(
      result
    ) {

      if (
        !result ||
        !result.landmarks ||
        result.landmarks.length ===
          0
      ) {

        handStateRef.current =
          "NONE";

        setHandState(
          "NONE"
        );

        return;
      }


      // Lấy bàn tay đầu tiên
      const landmarks =
        result.landmarks[0];


      // ==================================================
      // INDEX FINGER TIP
      // ==================================================

      const indexTip =
        landmarks[8];


      // --------------------------------------------------
      // Mirror camera
      // --------------------------------------------------

      const x =
        (
          1 -
          indexTip.x
        ) *
        window.innerWidth;


      const y =
        indexTip.y *
        window.innerHeight;


      // --------------------------------------------------
      // Update target
      // --------------------------------------------------

      targetRef.current = {
        x,
        y,
      };


      // ==================================================
      // HAND STATE
      // ==================================================

      const state =
        classifyHand(
          landmarks
        );


      if (
        state !==
        handStateRef.current
      ) {

        handStateRef.current =
          state;

        setHandState(
          state
        );
      }
    }


    // ====================================================
    // HAND DETECTION LOOP
    // ====================================================

    function detectHands() {

      if (
        cancelled
      ) {
        return;
      }


      const video =
        videoRef.current;


      const landmarker =
        handLandmarkerRef.current;


      if (
        !video ||
        !landmarker ||
        video.readyState < 2
      ) {

        handDetectionRef.current =
          requestAnimationFrame(
            detectHands
          );

        return;
      }


      // --------------------------------------------------
      // Chỉ xử lý frame mới
      // --------------------------------------------------

      if (
        video.currentTime !==
        lastVideoTimeRef.current
      ) {

        lastVideoTimeRef.current =
          video.currentTime;


        try {

          const result =
            landmarker.detectForVideo(
              video,
              performance.now()
            );


          processHand(
            result
          );

        } catch (
          detectionError
        ) {

          console.error(
            detectionError
          );
        }
      }


      handDetectionRef.current =
        requestAnimationFrame(
          detectHands
        );
    }


    // ====================================================
    // START CAMERA
    // ====================================================

    async function start() {

      try {

        setLoading(
          true
        );


        // =================================================
        // CAMERA
        // =================================================

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                width: {
                  ideal: 1280,
                },

                height: {
                  ideal: 720,
                },

                facingMode:
                  "user",
              },

              audio: false,
            }
          );


        if (
          cancelled
        ) {

          stream
            .getTracks()
            .forEach(
              (track) =>
                track.stop()
            );

          return;
        }


        streamRef.current =
          stream;


        const video =
          videoRef.current;


        video.srcObject =
          stream;


        await video.play();


        // =================================================
        // MEDIAPIPE WASM
        // =================================================

        const vision =
          await FilesetResolver.forVisionTasks(
            WASM_URL
          );


        // =================================================
        // HAND LANDMARKER
        // =================================================

        const landmarker =
          await HandLandmarker.createFromOptions(
            vision,
            {

              baseOptions: {

                modelAssetPath:
                  MODEL_URL,

                delegate:
                  "GPU",

              },


              runningMode:
                "VIDEO",


              numHands:
                1,


              minHandDetectionConfidence:
                0.55,


              minHandPresenceConfidence:
                0.55,


              minTrackingConfidence:
                0.55,

            }
          );


        if (
          cancelled
        ) {

          landmarker.close();

          return;
        }


        handLandmarkerRef.current =
          landmarker;


        // =================================================
        // READY
        // =================================================

        resize();

        window.addEventListener(
          "resize",
          resize
        );


        setLoading(
          false
        );


        // Start loops
        animate();

        detectHands();

      } catch (
        cameraError
      ) {

        console.error("SWORD ERROR:", cameraError);

        setError(
          cameraError?.message ||
          "Có lỗi khi khởi tạo camera hoặc MediaPipe."
        );

        setLoading(
          false
        );
      }
    }


    // ====================================================
    // START
    // ====================================================

    start();


    // ====================================================
    // CLEANUP
    // ====================================================

    return () => {

      cancelled = true;


      // Animation
      if (
        animationRef.current
      ) {

        cancelAnimationFrame(
          animationRef.current
        );
      }


      // Hand detection
      if (
        handDetectionRef.current
      ) {

        cancelAnimationFrame(
          handDetectionRef.current
        );
      }


      // Resize
      window.removeEventListener(
        "resize",
        resize
      );


      // Camera
      if (
        streamRef.current
      ) {

        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        streamRef.current =
          null;
      }


      // MediaPipe
      if (
        handLandmarkerRef.current
      ) {

        try {

          handLandmarkerRef.current.close();

        } catch {}

        handLandmarkerRef.current =
          null;
      }

    };

  }, []);


  // ======================================================
  // UI
  // ======================================================

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,

        width: "100vw",
        height: "100vh",

        overflow: "hidden",

        background:
          "#020617",
      }}
    >

      {/* ==================================================
          CANVAS
      ================================================== */}

      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",

          inset: 0,

          width: "100vw",
          height: "100vh",

          display: "block",

          zIndex: 1,
        }}
      />


      {/* ==================================================
          CAMERA
      ================================================== */}

      <video
        ref={videoRef}

        muted

        playsInline

        style={{
          position: "fixed",

          right: 20,

          bottom: 20,

          width: 240,

          height: 180,

          objectFit: "cover",

          borderRadius: 14,

          border:
            "2px solid rgba(0,234,255,0.8)",

          boxShadow:
            "0 0 25px rgba(0,234,255,0.25)",

          transform:
            "scaleX(-1)",

          zIndex: 10,

          background:
            "#020617",
        }}
      />


      {/* ==================================================
          STATUS
      ================================================== */}

      <div
        style={{
          position: "fixed",

          top: 20,

          left: 20,

          zIndex: 20,

          padding:
            "15px 20px",

          minWidth: 190,

          borderRadius: 14,

          background:
            "rgba(2,6,23,0.78)",

          border:
            "1px solid rgba(0,234,255,0.4)",

          boxShadow:
            "0 0 30px rgba(0,234,255,0.08)",

          backdropFilter:
            "blur(12px)",

          color: "#ffffff",
        }}
      >

        <div
          style={{
            fontSize: 11,

            color:
              "#64748b",

            letterSpacing:
              "2px",
          }}
        >
          SWORD CONTROL
        </div>


        <div
          style={{
            marginTop: 6,

            fontSize: 22,

            fontWeight:
              "bold",

            color:
              handState ===
              "POINTING"
                ? "#00eaff"
                : handState ===
                  "OPEN"
                ? "#7cff6b"
                : handState ===
                  "CLOSED"
                ? "#ff416c"
                : "#64748b",
          }}
        >
          {handState}
        </div>


        <div
          style={{
            marginTop: 10,

            fontSize: 11,

            lineHeight: 1.7,

            color:
              "#94a3b8",
          }}
        >
          ☝️ Point → Aim
          <br />

          ✋ Open → Spread
          <br />

          ✊ Close → Attack
        </div>

      </div>


      {/* ==================================================
          LOADING
      ================================================== */}

      {loading && (

        <div
          style={{
            position: "fixed",

            inset: 0,

            zIndex: 100,

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            background:
              "rgba(2,6,23,0.96)",

            color:
              "#00eaff",

            fontSize: 20,

            letterSpacing:
              "1px",
          }}
        >
          Đang khởi động
          camera...
        </div>

      )}


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div
          style={{
            position: "fixed",

            top: "50%",

            left: "50%",

            transform:
              "translate(-50%,-50%)",

            zIndex: 200,

            width: 350,

            maxWidth:
              "calc(100vw - 40px)",

            padding: 25,

            borderRadius: 16,

            background:
              "#111827",

            border:
              "1px solid #ef4444",

            color:
              "#f87171",

            textAlign:
              "center",

            lineHeight: 1.6,
          }}
        >
          {error}
        </div>

      )}

    </div>
  );
}
