# Area ONE — Ghi chú dự án cho Claude

## Tổng quan
- App học tiếng Anh cho người Việt "mất gốc"
- Tên app: **Area ONE**, mascot: **OĂN (ONE)**
- Stack: React Native + Expo SDK 54, TypeScript
- Test: Expo Go trên iPhone (quét QR)
- Repo: `areaoneamusement/howtolearnenglish`
- Branch làm việc: `claude/setup-english-app-R6ee5`
- Email: areaone.amusement@gmail.com

## Phân công
- **User**: quyết định sản phẩm, test trên điện thoại
- **Claude**: viết toàn bộ code, commit, push
- **Ngôn ngữ giao tiếp**: tiếng Việt

## Quy trình làm việc
1. User test → báo lỗi hoặc yêu cầu tính năng
2. Claude hỏi làm rõ nếu cần, rồi code
3. Commit + push lên GitHub
4. User chạy `git pull && npm install && npx expo start` để test

## Màu sắc brand Area ONE
| Màu | Hex | Dùng cho |
|-----|-----|---------|
| Xanh dương | `#1274C6` | Text chính, tiêu đề, icon active |
| Tím | `#A527FF` | Accent, brand name, nút chính |
| Xanh lá | `#00C896` | Đúng / Success |
| Đỏ | `#FF6B6B` | Sai / Error |
| Nền map | `#D6EEFF` | Background HomeMapScreen |
| Nền app | `#F8F9FF` | Background chung |

## Font chữ (assets/fonts/)
| File | Biến | Dùng cho |
|------|------|---------|
| `Nikoovers.ttf` | `'Nikoovers'` | Brand name "Area ONE", tên "OĂN", header title |
| `MontserratLight.otf` | `'MontserratLight'` | Body text, mô tả |
| `BlancInline.ttf` | `'BlancInline'` | Số lớn (streak, điểm %), từ tiếng Anh trên thẻ |

Load trong `App.tsx` qua `useFonts` của `expo-font`.

## Kiến trúc navigation (không dùng React Navigation)
```
AppView: 'tabs' | 'game' | 'results'
TabName: 'home' | 'activity' | 'leaderboard' | 'profile'
```
- `tabs`: hiển thị BottomNav + màn hình tab
- `game`: full-screen GameScreen (không có BottomNav)
- `results`: full-screen ResultsScreen

## Cấu trúc file quan trọng
```
App.tsx                        — Navigation root, load fonts, profile check
src/
  data/vocabulary.ts           — Từ vựng: topics (16 nền tảng) + studentTopics, bankingTopics, businessTopics, tourismTopics
  hooks/
    useProgress.ts             — Lưu tiến độ học vào AsyncStorage
    useProfile.ts              — Lưu profile người dùng (userType)
  components/
    BottomNav.tsx              — Tab bar
    OanMascot.tsx              — Nhân vật OĂN vẽ bằng RN thuần (không cần ảnh)
  screens/
    OnboardingScreen.tsx       — Survey lần đầu mở app
    HomeMapScreen.tsx          — Bản đồ học Duolingo-style (nhận topics từ props)
    GameScreen.tsx             — Flashcard + Quiz + Review round
    ResultsScreen.tsx          — Kết quả sau session
    ActivityScreen.tsx         — Streak, XP, tiến độ từng chủ đề
    LeaderboardScreen.tsx      — Placeholder MVP2
    ProfileScreen.tsx          — Hồ sơ, stats, reset tiến độ
```

## Data model — vocabulary.ts
```ts
type TopicGroup = 'foundation' | 'student' | 'banking' | 'business' | 'tourism';
type Topic = { id, name, icon, color, group?, words[] }
type Word  = { english, vietnamese, pronunciation, level: 'A1'|'A2'|'B1' }
```
- 16 topic nền tảng (không có `group` → mặc định `foundation`)
- 8 topic nghề nghiệp có `group` tag

## Profile người dùng
```ts
type UserType = 'student' | 'banking' | 'business' | 'tourism';
```
- Lưu ở `@htlenglish_profile` trong AsyncStorage
- Lần đầu vào app → OnboardingScreen
- `profileTopics` = foundation topics + topics theo userType
- Có thể xóa profile qua "Xóa tiến độ" trong ProfileScreen

## Spaced repetition (useProgress.ts)
- Key: `"topicId_wordIndex"` lưu trong AsyncStorage `@htlenglish_progress`
- `new` → `learning` (đúng 1 lần) → `known` (đúng 3 lần tích lũy)
- Sai: correctCount giảm 1, status về `learning`
- XP: +10 cho từ `new`, +5 cho từ `learning`/`known`
- Streak: tăng nếu học ngày hôm nay sau hôm qua, reset nếu bỏ > 1 ngày

## Logic mở khoá bản đồ
- Topic N mở khi topic N-1 có `known + learning > 0` (đã đúng ít nhất 1 từ)
- Hoàn thành topic: ≥ 70% từ đạt `known`

## GameScreen — Review round (tính năng chính)
Khi vào topic N (N ≥ 2) mà không bị lùi bước (`skipReview = false`):
1. Hiện 3 câu trắc nghiệm random từ tất cả topic 0..N-1
2. Đúng ≥ 2/3 → qua, chọn flashcard/quiz rồi học
3. Đúng < 2/3 → `onFailReview()` → App lùi về topic N-1, `skipReview = true`
4. Khi bị lùi: học topic N-1 không có review (skipReview)

## Animation — Quy tắc bắt buộc
**`useNativeDriver: false` cho TẤT CẢ animation trong GameScreen**
(vì có mixed transform: pan + flip trên cùng component)

## PanResponder — Bug closure đã fix
Dùng `useRef` thay `useState` cho giá trị đọc trong PanResponder:
```ts
const flippedRef = useRef(false);   // đọc trong PanResponder
const [flipped, setFlipped] = useState(false); // chỉ để re-render UI
// Khi flip: flippedRef.current = true; setFlipped(true);
```

## Phát âm — expo-speech
```ts
import * as Speech from 'expo-speech';
Speech.speak(word.english, { language: 'en-US', rate: 0.85 });
```
- Tự động đọc khi card mới mount (useEffect)
- Cleanup: `Speech.stop()` khi unmount
- Nút "🔊 Nghe lại" trên mỗi card

## OanMascot component
```tsx
<OanMascot size={80} />  // size = chiều cao, width = size * 0.72
```
Dùng ở: HomeMapScreen (header 38, map 68), LeaderboardScreen (120), ProfileScreen (110)

## Lỗi đã gặp & cách fix
| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| useNativeDriver crash | flipAnim dùng `true`, pan dùng `false` cùng transform | Đổi tất cả sang `false` |
| Swipe không hoạt động sau flip | PanResponder closure bắt giá trị `flipped` cũ | Dùng `useRef` thay `useState` |
| `git pull` conflict mascot.png | File ảnh thật vs placeholder | `mv mascot.png mascot_real.png` → pull → `mv` lại |
| `package-lock.json` conflict | File local vs remote | `rm package-lock.json` rồi pull |
| ConfigError package.json not found | Chạy lệnh từ sai thư mục | Luôn `cd ~/howtolearnenglish` trước |

## Workflow khi user gặp lỗi expo
User cần vào đúng thư mục:
```bash
cd ~/howtolearnenglish
git pull && npm install && npx expo start
```

## MVP roadmap
- **MVP1** ✅: Bản đồ, flashcard swipe, quiz, streak/XP, spaced repetition, OĂN mascot, brand colors, fonts
- **MVP2 (đang làm)**:
  - ✅ Phát âm (expo-speech)
  - ✅ Từ vựng theo nghề nghiệp + onboarding survey
  - ⬜ Bảng xếp hạng thật (cần Firebase)
  - ⬜ Thách đấu bạn bè real-time (cần Firebase)
