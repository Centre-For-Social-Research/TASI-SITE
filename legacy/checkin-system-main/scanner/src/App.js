import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import logo from "./assets/logo svg.svg";
import Accepted from "./Accepted";
import { AcceptedTag, RefusedTag, AllreadyAcceptedTag } from "./Tags";

const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || "";
const apiKey = import.meta.env.VITE_CHECKIN_API_KEY || "";
const url = `${backendBaseUrl.replace(/\/$/, "")}/api/v1/postData`;

export default function App() {
  const [cameraOn, setCameraOn] = useState(false);
  const [classNameStyle, setClassNameStyle] = useState("");
  const [isfetching, setIsfetching] = useState(false);
  const [scanError, setScanError] = useState("");
  const [acceptedInfo, setAcceptedInfo] = useState(null);
  const classNameStyles = useMemo(() => ["accepted", "already-accepted", "not-accepted"], []);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const frameLockRef = useRef(false);

  const canScan = useMemo(() => typeof window !== "undefined" && "BarcodeDetector" in window, []);

  useEffect(() => {
    if (canScan) {
      detectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
    }
  }, [canScan]);

  const handleScann = useCallback(async (rawValue) => {
    if (!rawValue) {
      return;
    }

    setCameraOn(false);
    setIsfetching(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({ id: rawValue }),
      });
      const data = await response.json().catch(() => ({}));
      setAcceptedInfo(data);
      setClassNameStyle(classNameStyles[[200, 409, 404].indexOf(response.status)] || "");
    } catch (error) {
      setScanError(error.message);
      setClassNameStyle("");
    } finally {
      setIsfetching(false);
    }
  }, [classNameStyles]);

  useEffect(() => {
    let intervalId;
    const videoElement = videoRef.current;

    const startCamera = async () => {
      if (!cameraOn || !canScan) {
        return;
      }

      try {
        setScanError("");
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (videoElement) {
          videoElement.srcObject = streamRef.current;
          await videoElement.play();
        }

        intervalId = window.setInterval(async () => {
          if (!detectorRef.current || !videoElement || isfetching || frameLockRef.current) {
            return;
          }

          try {
            frameLockRef.current = true;
            const results = await detectorRef.current.detect(videoElement);
            const value = results[0]?.rawValue;
            if (value) {
              handleScann(value);
            }
          } catch {
            // Ignore transient frame read errors.
          } finally {
            frameLockRef.current = false;
          }
        }, 450);
      } catch (error) {
        setScanError(`Unable to access camera: ${error.message}`);
      }
    };

    startCamera();

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoElement) {
        videoElement.srcObject = null;
      }
      frameLockRef.current = false;
    };
  }, [cameraOn, isfetching, canScan, handleScann]);

  return (
    <div style={{ padding: "1rem" }}>
      <center>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="logo" style={{ zoom: "0.6", margin: "20px", width: 300 }} src={logo} />
      </center>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "start" }}>
        <section>
          <div style={{ width: "500px", maxWidth: "100%" }}>
            {cameraOn ? (
              <video ref={videoRef} muted playsInline style={{ width: "100%", borderRadius: "10px" }} />
            ) : (
              <div style={{ width: "100%", height: "500px", backgroundColor: "#363232", borderRadius: "10px" }}></div>
            )}
          </div>

          {!canScan ? (
            <p style={{ color: "#d32f2f", marginTop: "8px" }}>
              QR scanning requires a modern browser with BarcodeDetector support.
            </p>
          ) : null}

          {scanError ? <p style={{ color: "#d32f2f", marginTop: "8px" }}>{scanError}</p> : null}

          <button
            type="button"
            style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #999", cursor: "pointer" }}
            onClick={() => {
              setCameraOn(!cameraOn);
              setClassNameStyle("");
            }}
          >
            {cameraOn ? "Close Camera" : "Open Camera"}
          </button>
        </section>

        <section style={{ minHeight: "500px" }}>
          {isfetching ? (
            <section className="content">
              <center>
                <h2>Verifying...</h2>
              </center>
            </section>
          ) : classNameStyle === "accepted" ? (
            <section className="content">
              <div>
                <Accepted data={acceptedInfo || {}} />
                <center>
                  <AcceptedTag />
                </center>
              </div>
            </section>
          ) : classNameStyle === "already-accepted" ? (
            <section className="content">
              <center>
                <AllreadyAcceptedTag />
              </center>
            </section>
          ) : classNameStyle === "not-accepted" ? (
            <section className="content">
              <center>
                <RefusedTag />
              </center>
            </section>
          ) : (
            <section className="content">
              <center>
                <h1>SCAN THE PARTICIPANT&apos;S QR-CODE</h1>
              </center>
            </section>
          )}
        </section>
      </div>
    </div>
  );
}
