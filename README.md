# Video Timestamp (비디오 타임스탬프)

브라우저에서 직접 비디오에 타임스탬프 자막을 입혀주는 웹 애플리케이션입니다.  
서버로 영상을 업로드할 필요 없이, **ffmpeg.wasm**을 사용하여 클라이언트(브라우저)에서 모든 처리가 이루어집니다.

![Project Screenshot](public/screenshot.png)

## ✨ 주요 기능 (Features)

- **🔒 개인정보 보호**: 영상이 외부 서버로 전송되지 않고 사용자의 브라우저 내에서 안전하게 처리됩니다.
- **⚡ 빠른 처리**: WebAssembly 기반의 FFmpeg를 사용하여 빠르고 효율적으로 자막을 인코딩합니다.
- **📅 자동 시간 추출**: 파일명(예: Tesla 대시캠)을 분석하여 촬영 시간을 자동으로 감지합니다.
- **🎨 실시간 미리보기**: 자막 형식을 변경하면 플레이어에서 즉시 미리볼 수 있습니다.
- **💾 간편한 저장**: File System Access API를 지원하여, 변환된 영상을 원하는 폴더에 즉시 저장할 수 있습니다. (Chrome/Edge 지원)
- **📝 커스텀 포맷**: 원하는 날짜/시간 형식(예: `yyyy-MM-dd HH:mm:ss`)을 자유롭게 지정할 수 있습니다.

## 🛠 사용된 기술 (Tech Stack)

- **Framework**: [Next.js 14](https://nextjs.org/) (App Directory)
- **Core Engine**: [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) (Single Thread / Multi Thread supported)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript
- **UI Components**: Shadcn/ui

## 🚀 시작하기 (Getting Started)

### 사전 요구사항 (Prerequisites)

- Node.js 18.0.0 이상
- npm 또는 yarn, pnpm

### 설치 및 실행 (Installation & Run)

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-username/video-timestamp.git
   cd video-timestamp
   ```

2. **패키지 설치**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **FFmpeg 리소스 설정** (중요)
   - `public/ffmpeg/` 폴더에 `ffmpeg-core.js`, `ffmpeg-core.wasm` 등이 위치해야 합니다.
   - `public/fonts/` 폴더에 `arial.ttf` 폰트 파일이 필요합니다.

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

5. **브라우저 접속**
   `http://localhost:3000` 주소로 접속하여 확인합니다.

## 📖 사용 방법 (Usage)

1. **영상 선택**: 왼쪽의 비디오 영역이나 인스펙터의 "Select File" 버튼을 눌러 영상을 선택합니다.
2. **시간 확인**: 영상의 촬영 시간이 자동으로 추출됩니다. 필요시 수동으로 수정할 수 있습니다.
3. **자막 형식 설정**: 우측 인스펙터에서 자막 형식을 지정합니다 (기본값: `yyyy-MM-dd HH:mm:ss`).
4. **저장 경로/이름 확인**: 저장될 파일명을 확인합니다. (기본값: `원본파일명_timestamp.mp4`)
5. **영상 생성**: "Create Video" 버튼을 누릅니다. 저장 위치를 선택하면 즉시 변환이 시작됩니다.

## 📄 라이선스 (License)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
