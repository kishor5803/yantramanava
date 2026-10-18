import os
import sys
import time
import math
import subprocess


if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import cv2  # type: ignore

import mediapipe as mp  # type: ignore
import speech_recognition as sr  # type: ignore
try:
    from gtts import gTTS  # type: ignore
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False
    gTTS = None

try:
    import pyttsx3  # type: ignore
    PYTTSX3_AVAILABLE = True
except ImportError:
    PYTTSX3_AVAILABLE = False
    pyttsx3 = None

from dotenv import load_dotenv  # type: ignore

# Load environment variables from .env file if available
load_dotenv()

# Try importing OpenAI client safely
try:
    from openai import OpenAI  # type: ignore
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


# --- VERIFIED KARNATAKA HERITAGE KNOWLEDGE BASE (Anti-Fake Guide RAG System) ---
VERIFIED_DATA = {
    "hampi": (
        "Hampi was the majestic capital of the Vijayanagara Empire (14th–16th century). "
        "It is a UNESCO World Heritage Site famous for the active Virupaksha Temple, the legendary Stone Chariot "
        "at Vittala Temple, musical pillars, and breathtaking boulder hills along the Tungabhadra River."
    ),
    "mysore": (
        "Mysore (Mysuru) is Karnataka's cultural capital, famous for the magnificent Mysore Palace (Amba Vilas), "
        "a showcase of Indo-Saracenic architecture. It is celebrated worldwide for the grand Mysore Dasara festival, "
        "Chamundi Hill Temple, silk sarees, and Mysore Pak sweet."
    ),
    "belur": (
        "Belur is renowned for the 12th-century Chennakeshava Temple built by Hoysala King Vishnuvardhana. "
        "It features star-shaped architectural platforms, intricate soapstone sculptures, and the famous bracket figures (Madanikas)."
    ),
    "halebidu": (
        "Halebidu was the regnal capital of the Hoysala Empire. The Hoysaleswara and Kedareshwara temples feature "
        "friezes of elephants, lions, mythological stories, and unmatched stone craftsmanship."
    ),
    "pattadakal": (
        "Pattadakal is a UNESCO World Heritage Site showcasing a harmonious blend of North Indian (Nagara) and "
        "South Indian (Dravidian) temple architecture built by the Badami Chalukyas in the 7th and 8th centuries."
    ),
    "badami": (
        "Badami is famous for its rock-cut cave temples carved into red sandstone cliffs overlooking Agastya Lake. "
        "The caves depict Lord Shiva, Lord Vishnu, and Tirthankaras."
    ),
    "coorg": (
        "Coorg (Kodagu) is known as the 'Scotland of India', famous for lush coffee plantations, misty hills, "
        "Abbey Falls, Raja's Seat, Talakaveri (the origin of River Kaveri), and Kodava culture."
    ),
    "gokarna": (
        "Gokarna is a coastal town famous for the holy Mahabaleshwar Temple containing the Atmalinga, "
        "as well as scenic beaches like Om Beach, Half Moon Beach, and Kudle Beach."
    ),
    "jog falls": (
        "Jog Falls is the 2nd steepest waterfall in India, created by the Sharavathi River dropping 253 meters in four distinct cascades: Raja, Roarer, Rocket, and Rani."
    ),
    "channapatna": (
        "Channapatna is famous as the 'Gombegala Ooru' (Toy Town) of Karnataka, known for traditional handcrafted lacquerware wooden toys."
    ),
    "shravanabelagola": (
        "Shravanabelagola is one of the most prominent Jain pilgrimage destinations, featuring the colossal 57-foot monolithic statue of Lord Bahubali (Gommateshwara)."
    )
}

class Yantramanava:
    """
    Yantramanava: AI Tour Guide Robot for Karnataka Tourism
    Integrates Speech Recognition, Multilingual TTS, Verified Heritage RAG, OpenAI Fallback,
    and MediaPipe Sign Language / Gesture Accessibility.
    """
    def __init__(self, use_gtts=True):
        print("\n=======================================================")
        print("🤖 INITIALIZING YANTRAMANAVA - KARNATAKA TOURISM ROBOT")
        print("=======================================================")

        # OpenAI Setup
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = None
        if OPENAI_AVAILABLE and self.api_key:
            try:
                self.client = OpenAI(api_key=self.api_key)
                print("✓ OpenAI client initialized.")
            except Exception as e:
                print(f"⚠️ OpenAI initialization warning: {e}")
        else:
            print("ℹ️ Operating in Verified RAG Mode (No active OpenAI key needed).")

        # MediaPipe Hands Setup
        self.mp_hands = None
        self.hands = None
        self.mp_draw = None
        try:
            if hasattr(mp, 'solutions') and hasattr(mp.solutions, 'hands'):
                self.mp_hands = mp.solutions.hands
                self.hands = self.mp_hands.Hands(
                    static_image_mode=False,
                    max_num_hands=1,
                    min_detection_confidence=0.7,
                    min_tracking_confidence=0.7
                )
                self.mp_draw = mp.solutions.drawing_utils
                print("✓ MediaPipe Gesture Engine active.")
            else:
                print("ℹ️ MediaPipe solutions module not available in this build. Camera mode will use fallback overlay.")
        except Exception as e:
            print(f"⚠️ MediaPipe setup warning: {e}")


        # Speech Output Mode
        self.use_gtts = use_gtts
        self.tts_engine = None
        if PYTTSX3_AVAILABLE and pyttsx3 is not None:
            try:
                self.tts_engine = pyttsx3.init()
                self.tts_engine.setProperty('rate', 155)
            except Exception:
                self.tts_engine = None

    def listen(self, timeout=5):
        """Captures voice input from microphone and converts to text using SpeechRecognition."""
        recognizer = sr.Recognizer()
        with sr.Microphone() as source:
            print("\n🎙️ Listening... (Ask me about Hampi, Mysore, Belur, Coorg, Gokarna, etc.)")
            recognizer.adjust_for_ambient_noise(source, duration=0.8)
            try:
                audio = recognizer.listen(source, timeout=timeout, phrase_time_limit=10)
                recognize_google = getattr(recognizer, "recognize_google", None)
                if callable(recognize_google):
                    text = str(recognize_google(audio))
                else:
                    text = ""
                print(f"👤 Visitor Said: \"{text}\"")
                return text.lower()
            except sr.WaitTimeoutError:
                return None
            except sr.UnknownValueError:
                print("⚠️ Could not understand audio clearly.")
                return None
            except sr.RequestError as e:
                print(f"⚠️ Could not request results from Google Speech Recognition service; {e}")
                return None
            except Exception as e:
                print(f"⚠️ Microphone error: {e}")
                return None

    def speak(self, text, lang='en'):
        """Outputs speech via gTTS (online mp3 play) or pyttsx3 (offline fallback)."""
        print(f"🤖 Yantramanava ({lang}): {text}")
        
        if self.use_gtts and GTTS_AVAILABLE and gTTS is not None:
            try:
                tts = gTTS(text=text, lang=lang)
                filename = "yantramanava_speech.mp3"
                tts.save(filename)
                
                if sys.platform.startswith('win'):
                    subprocess.run(["powershell", "-c", f'start "{filename}"'], check=False)
                elif sys.platform.startswith('darwin'):
                    subprocess.run(["afplay", filename], check=False)
                else:
                    subprocess.run(["mpg123", filename], check=False)
                return
            except Exception as e:
                print(f"⚠️ gTTS playback warning: {e}. Falling back to pyttsx3.")

        if self.tts_engine:
            self.tts_engine.say(text)
            self.tts_engine.runAndWait()

    def generate_response(self, user_input):
        """
        RAG Reasoning Engine:
        1. Checks exact/fuzzy matches in VERIFIED_DATA (Prevents fake historical myths).
        2. If not found, attempts OpenAI LLM request constrained to verified tourism facts.
        3. Returns friendly default if query is unknown.
        """
        user_input_lower = user_input.lower()

        # Step 1: Check Verified Knowledge Base (RAG)
        for key, value in VERIFIED_DATA.items():
            if key in user_input_lower:
                print(f"🎯 RAG Match found for landmark: [{key.upper()}]")
                return value

        # Step 2: Fallback to LLM if key is present
        if self.client:
            try:
                print("🧠 Querying LLM for verified Karnataka historical context...")
                response = self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system", 
                            "content": (
                                "You are Yantramanava, an official Karnataka Tourism AI Robot. "
                                "Provide accurate, respectful, verified historical & cultural information about Karnataka. "
                                "Keep responses under 3 sentences. If unsure, advise the tourist to consult a licensed KSTDC guide."
                            )
                        },
                        {"role": "user", "content": user_input}
                    ],
                    max_tokens=150
                )
                content = response.choices[0].message.content
                return content.strip() if content else ""
            except Exception as e:
                print(f"⚠️ LLM Error: {e}")

        # General helpful greeting response
        if any(w in user_input_lower for w in ["hello", "hi", "namaskara", "namaste"]):
            return "Namaskara! Welcome to Karnataka - One State, Many Worlds. I am Yantramanava, your AI heritage guide. Ask me about Hampi, Mysore Palace, Belur, Coorg, or Gokarna!"

        return "Karnataka offers magnificent heritage sites like Hampi, Mysore, Belur, and Badami. You can ask me specific details about any of these destinations!"

    def classify_gesture(self, landmarks):
        """
        Calculates hand landmark geometry to classify gestures:
        - OPEN PALM: All fingers extended -> 'HELP MODE'
        - THUMBS UP: Thumb pointing up, fingers curled -> 'CONFIRMATION'
        - PEACE / V-SIGN: Index & Middle fingers extended -> 'GREETINGS'
        - FIST: All fingers curled -> 'STOP'
        """
        # Landmark indices:
        # Wrist = 0
        # Thumb = 4, Index = 8, Middle = 12, Ring = 16, Pinky = 20
        # MCP joints = 2, 5, 9, 13, 17

        def distance(p1, p2):
            return math.hypot(p1.x - p2.x, p1.y - p2.y)

        wrist = landmarks[0]
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]

        index_mcp = landmarks[5]
        middle_mcp = landmarks[9]
        ring_mcp = landmarks[13]
        pinky_mcp = landmarks[17]

        # Finger extension states
        index_open = index_tip.y < index_mcp.y
        middle_open = middle_tip.y < middle_mcp.y
        ring_open = ring_tip.y < ring_mcp.y
        pinky_open = pinky_tip.y < pinky_mcp.y
        thumb_up = thumb_tip.y < wrist.y and thumb_tip.y < index_mcp.y

        if index_open and middle_open and ring_open and pinky_open:
            return "HELP MODE 🖐️"
        elif thumb_up and not index_open and not middle_open and not ring_open:
            return "LIKE / CONFIRM 👍"
        elif index_open and middle_open and not ring_open and not pinky_open:
            return "NAMASKARA / GREETINGS ✌️"
        elif not index_open and not middle_open and not ring_open and not pinky_open:
            return "STOP / WAIT ✊"
        
        return "GESTURE DETECTED"

    def detect_gesture(self):
        """Launches OpenCV camera feed for MediaPipe gesture and sign language recognition."""
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("⚠️ Camera could not be opened. Skipping live vision mode.")
            return

        print("📸 Yantramanava Vision Active. Show hand gestures to the camera (Press 'q' to stop vision)...")
        
        while cap.isOpened():
            success, img = cap.read()
            if not success:
                break

            img = cv2.flip(img, 1) # Mirror display
            if self.hands:
                img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                results = self.hands.process(img_rgb)

                if results.multi_hand_landmarks:
                    for hand_landmarks in results.multi_hand_landmarks:
                        if self.mp_draw and self.mp_hands:
                            self.mp_draw.draw_landmarks(img, hand_landmarks, self.mp_hands.HAND_CONNECTIONS)
                        gesture = self.classify_gesture(hand_landmarks.landmark)

                        # Overlay gesture text
                        cv2.rectangle(img, (10, 20), (450, 70), (0, 0, 0), cv2.FILLED)
                        cv2.putText(img, f"Yantramanava Vision: {gesture}", (20, 55),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            else:
                cv2.rectangle(img, (10, 20), (500, 70), (0, 0, 0), cv2.FILLED)
                cv2.putText(img, "Yantramanava Vision (Camera Active)", (20, 55),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)


            cv2.imshow("Yantramanava Accessibility Vision", img)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    robot = Yantramanava()
    robot.speak("Namaskara! I am Yantramanava, your Karnataka AI Tourism Guide. Ask me a question or type your destination.")

    print("\n--- YANTRAMANAVA MENU ---")
    print("1. Voice Interactive Mode")
    print("2. Camera Sign Language / Gesture Vision")
    print("3. Text Interactive Mode")
    print("4. Exit")

    while True:
        try:
            choice = input("\nSelect Mode (1-4): ").strip()
            if choice == "1":
                query = robot.listen()
                if query:
                    if "exit" in query or "stop" in query:
                        robot.speak("Namaskara! Have a wonderful trip across Karnataka!")
                        break
                    lang = 'kn' if 'kannada' in query else 'en'
                    answer = robot.generate_response(query)
                    robot.speak(answer, lang=lang)
            elif choice == "2":
                robot.detect_gesture()
            elif choice == "3":
                text_query = input("Type your tourism query: ").strip()
                if text_query.lower() in ["exit", "quit", "stop"]:
                    robot.speak("Namaskara! See you soon in Karnataka!")
                    break
                lang = 'kn' if 'kannada' in text_query.lower() else 'en'
                answer = robot.generate_response(text_query)
                robot.speak(answer, lang=lang)
            elif choice == "4":
                robot.speak("Namaskara! Have a peaceful visit to Karnataka.")
                break
            else:
                print("Invalid choice. Please select 1, 2, 3, or 4.")
        except KeyboardInterrupt:
            print("\nExiting Yantramanava gracefully...")
            break
