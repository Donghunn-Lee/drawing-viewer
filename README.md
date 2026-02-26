````
# Drawing Viewer

Teamwork frontend assignment – Drawing Viewer

## 실행 방법

```bash
npm install
npm run dev
````

## 기술 스택

- React 19
- TypeScript
- Vite
- Canvas API
- CSS Module
- lucide-react (icons)

## 구현 기능

- [x] 메타데이터 기반 도면 탐색 (도면 / 공종 / 구역 / 리비전)
- [x] Canvas 기반 도면 렌더링
- [x] 마우스 휠 줌 및 드래그 패닝
- [x] 도면 오버레이 표시 (정합성 보장 가능한 경우에 한함)
- [x] 오버레이 투명도 조절
- [x] Polygon 영역 렌더링 및 hover / click 인터랙션
- [x] 현재 선택 상태에 따른 컨텍스트 정보 표시
- [x] 패널 토글을 통한 도면 영역 확장

## 미완성 기능

- [ ] 설계 단계에서 고려했으나 구현 범위에서 제외한 기능
  - 듀얼 뷰어를 통한 도면 동시 비교
  - 공종 및 리비전 간 자유로운 오버레이 비교
  - 컨트롤 패널 토글 시 발생하는 flicker 현상 완전 제거
