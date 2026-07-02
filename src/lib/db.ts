import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";

export interface Post {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  createdAt: string;
  type?: 'post' | 'work';
  imageUrl?: string;
  bgGradient?: string;
}

// Firebase 설정값 검증
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const isFirebaseEnabled = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

// Firebase 초기화
let db: any = null;
if (isFirebaseEnabled) {
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase 초기화 에러:", error);
  }
}

// --- LOCAL STORAGE FALLBACK IMPLEMENTATION ---
const LOCAL_STORAGE_KEY = "blog_cms_posts";

const INITIAL_POSTS: Post[] = [
  // --- 작업 (Work) 데이터 20개 탑재 (최신순 역순 정렬) ---
  { id: "w20", title: "보이지 않는 선", subtitle: "시각적 침묵의 경계와 입체 드로잉", content: "침묵은 소리의 부재가 아닙니다. 그것은 의도된 비움이며, 시각예술에서도 동일하게 작용합니다. 이번 드로잉 연작에서는 극도로 얇은 먹선과 한지의 틈을 통해 백색 공간 속의 보이지 않는 에너지를 조망합니다. 미니멀리즘 평면 회화가 공간과 대화하는 방식을 고찰한 첫 작업입니다.", createdAt: new Date("2026-06-30T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #dfddd6, #2e633f)" },
  { id: "w19", title: "구조와 사유", subtitle: "콘크리트 그리드의 기하학적 흔적", content: "노출 콘크리트의 거친 표면과 수직/수평 그리드가 만나는 선을 탐구했습니다. 건축적 구조물은 고정된 형태이지만 시간에 따른 빛의 각도에 의해 살아있는 사유를 촉발합니다. 이번 작업은 서울 변두리의 한 폐공장에서 기록한 기하학적 흑백 사진 연작과 입체 드로잉 연구입니다.", createdAt: new Date("2026-06-29T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #e5e3dc, #4d6052)" },
  { id: "w18", title: "기하학적 자연", subtitle: "화분 속 미시 세계와 대칭 레이아웃", content: "가장 복잡해 보이는 자연의 패턴 역시 들여다보면 엄격한 수학적 기하학과 대칭을 따릅니다. 겨울 동안 창가에서 자란 작은 다육식물들의 새잎 돋아남을 초접사 촬영하고, 이를 조형적인 대칭 그리드 드로잉으로 재구성하여 질서를 탐색했습니다.", createdAt: new Date("2026-06-28T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #e9e8e3, #3d5245)" },
  { id: "w17", title: "종이와 손끝", subtitle: "아날로그 활판 인쇄 디자인", content: "디지털 폰트의 완벽함에서 벗어나, 철인쇄기가 종이를 꾹 눌렀을 때 발생하는 물리적 압력과 거친 먹잉크의 흔적을 담았습니다. 120g 수입 크라프트지 위에 한 자 한 자 손으로 납활자를 배열하여 찍어낸 침묵의 문구들을 시집 형태로 제본했습니다.", createdAt: new Date("2026-06-27T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #dfddd6, #5c6e5f)" },
  { id: "w16", title: "빛의 두께", subtitle: "건축적 공간에 머무는 아침 햇살", content: "빛에도 부피와 무게가 있습니다. 콘크리트 기둥 사이로 쏟아져 내리는 아침 7시의 햇살을 긴 셔터 스피드로 담아내어, 마치 공기 중에 부유하는 고체와 같은 질감으로 아침의 고요를 시각화한 건축 사진 리포트입니다.", createdAt: new Date("2026-06-26T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #f2f1ec, #758679)" },
  { id: "w15", title: "흐려지는 조각들", subtitle: "시간에 따른 수묵의 번짐 연구", content: "기억은 정확한 복사가 아닌 은은한 번짐입니다. 화선지 위에 떨어진 물방울과 먹 한 방울이 모세관 현상에 의해 사방으로 퍼져나가는 속도를 시간에 따라 기록하며, 서서히 잊히는 유년의 특정 기억 파편들을 번짐의 형상으로 조율한 회화입니다.", createdAt: new Date("2026-06-25T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #e2e1db, #345e43)" },
  { id: "w14", title: "의도된 공백", subtitle: "비움으로써 드러나는 여백의 크기", content: "화면의 90%를 순수한 무채색 빈 캔버스로 비워두고, 우하단 모퉁이에 단 하나의 극소 점을 찍었을 때 감도는 긴장감을 구현했습니다. 보는 이의 시선이 비어 있는 공간을 유영하며 스스로 내면의 빈 소음을 마주하게 돕는 공간 지향적 미니멀 설치 미술입니다.", createdAt: new Date("2026-06-24T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #ebeae5, #68796d)" },
  { id: "w13", title: "나무의 결", subtitle: "수제 월넛 원목 오거나이저 설계", content: "나무의 나이테는 그 식물이 견뎌낸 수십 년 겨울의 저항 기록입니다. 오포읍의 공방에서 오랜 시간 건조한 북미산 호두나무를 손으로 깎아내고 호두 오일로 7회 마감하여 마찰감과 그립감이 극대화된 책상 위 연필 트레이 및 오거나이저를 만듭니다.", createdAt: new Date("2026-06-23T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #dedcd6, #415948)" },
  { id: "w12", title: "소음의 여과", subtitle: "도시 소음을 정화하는 화분 가리개", content: "복잡한 도심 도로변 빌딩의 창가에 놓일 모던한 패브릭 가리개와 도자기 화분 트레이의 결합 구조를 설계했습니다. 자연스러운 올 조직의 리넨과 황토 화분이 햇빛을 은은하게 거르고 기계음을 흡수하여 방 안의 음향적 밀도를 한층 차분히 낮추는 조각물입니다.", createdAt: new Date("2026-06-22T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #eae9e4, #536c5b)" },
  { id: "w11", title: "시간의 층위", subtitle: "수십 겹의 아크릴 젯소 질감 드로잉", content: "캔버스에 아크릴 젯소를 바르고 완전히 건조한 뒤 사포로 밀어내는 과정을 30회 이상 반복했습니다. 평면 드로잉이지만 미세한 높낮이의 층(Layer)이 빛의 입사각에 따라 다채로운 그림자 계조를 만들어 내어, 시간의 누적이 만들어 낸 물리적 깊이를 탐독합니다.", createdAt: new Date("2026-06-21T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #e4e2db, #2e633f)" },
  { id: "w10", title: "대칭과 비대칭", subtitle: "한글 타이포그래피 정렬 그리드", content: "한글 자모의 특이한 조형적 대칭과 비대칭성을 해체 분석했습니다. '김'과 '준'처럼 모음과 자음이 결합될 때 발생하는 우측 여백의 비대칭을 타이포그래피적으로 보완하고 음수 마진을 정밀 제어하여 한글 글자가 줄 수 있는 극도의 팽팽한 구조감을 활자 포스터로 제작했습니다.", createdAt: new Date("2026-06-20T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #e5e3dc, #4a6352)" },
  { id: "w9", title: "가장 얇은 선", subtitle: "0.25mm 황동 철사 드로잉 펜던트", content: "0.25mm 두께의 아주 연한 황동 철사만을 한 획으로 구부려 공중에 띄우는 모빌형 드로잉 펜던트입니다. 창으로 들어오는 실바람에 따라 황동 선이 회전하며 조용히 벽면에 그리는 실시간 드로잉 궤적이 공감각적인 위안을 선사합니다.", createdAt: new Date("2026-06-19T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #dfddd6, #3b5042)" },
  { id: "w8", title: "식물의 호흡", subtitle: "실내 온실용 세라믹 가습 포트 디자인", content: "유약을 바르지 않고 구워낸 옹기 질감의 백토 세라믹 가습 포트입니다. 포트 표면의 미세 기공으로 스며 나온 수분이 주변 식물 이파리에 아주 조용하고 일정한 밀도로 기화 증발하여 건조한 겨울철 실내 온실의 습도를 균일하게 지키는 기능성 조형 토기입니다.", createdAt: new Date("2026-06-18T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #eeebe4, #597061)" },
  { id: "w7", title: "물의 무게", subtitle: "잉크 입자의 비중 차이 시각 리포트", content: "서로 다른 비중을 가진 다섯 가지 염료 잉크를 실린더 물속에 낙하시켜 하강하는 속도와 응집 형태를 고속 매크로 카메라로 촬영한 시각 실험입니다. 물속에서 펼쳐지는 유체역학적 우연의 구조를 대형 리소그래프 아트북으로 인쇄해 엮었습니다.", createdAt: new Date("2026-06-17T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #e3e1da, #2e633f)" },
  { id: "w6", title: "그림자의 방향", subtitle: "사유를 유도하는 조명 갓의 개구부 설계", content: "빛을 널리 퍼뜨리는 일반 조명과 달리, 빛의 폭을 좁게 닫아두고 벽면 하단에만 가로 20cm의 은은한 가로선 그림자를 형성하도록 각도를 제어한 스틸 조명 갓입니다. 어두운 침실에서 오직 그 빛의 가로선만 응시하며 하루를 닫는 묵상을 이끌어 냅니다.", createdAt: new Date("2026-06-16T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #e5e4de, #6c8072)" },
  { id: "w5", title: "점과 면", subtitle: "황토 벽면에 칠한 먹묵 캔버스", content: "친환경 황토로 미장된 담백한 질감의 판넬 위에, 은은한 아교로 녹여낸 먹물을 아주 얇게 수차례 덧칠했습니다. 누런 흙빛 바탕과 반투명하게 얹힌 그을음의 검은 광택이 겹치면서 전통적인 소재가 현대적 미니멀 캔버스로 탄생하는 조화를 구현했습니다.", createdAt: new Date("2026-06-15T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #dedcd6, #3e5647)" },
  { id: "w4", title: "철학의 구조", subtitle: "텍스트 공간 배치의 다이어그램화", content: "프리드리히 니체의 '차라투스트라는 이렇게 말했다' 중 고독에 관한 핵심 구절들을 공간 다이어그램 형태로 타이포 배치했습니다. 단어 간의 간격을 30px, 90px 단위로 유동 조절하여 활자들이 종이 위에서 물리적 거리감과 사유의 여백을 지니게 조형했습니다.", createdAt: new Date("2026-06-14T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #ebeae5, #556c5e)" },
  { id: "w3", title: "흙의 온도", subtitle: "손물레로 성형한 분청사기 잔", content: "기계적인 틀을 배제하고 오직 두 손과 물레의 마찰력으로 빚어낸 거친 분청사기 찻잔입니다. 손자국이 미세하게 남은 잔 표면에 귀얄로 하얀 화장토를 슥 칠해 두어 거칠고 투박하면서도 마음을 차분히 데워주는 따뜻한 온기를 손끝에 전합니다.", createdAt: new Date("2026-06-13T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #e2e0da, #465f4d)" },
  { id: "w2", title: "바람의 진동", subtitle: "알루미늄 펜던트 모빌 균형 장치", content: "0.8mm 두께의 아주 가벼운 알루미늄 판재를 레이저 커팅하여 공중 지지선에 매달아 미세한 기류의 흐름에도 흔들리게 한 장치 미술입니다. 물리학적 대칭 무게중심을 정밀 연산하여 미세한 대기의 파동도 시각적 움직임으로 환원해 줍니다.", createdAt: new Date("2026-06-12T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #e8e7e1, #2e633f)" },
  { id: "w1", title: "여정의 시작", subtitle: "오피스 공간 브랜딩 디자인", content: "창조적인 생각을 돕는 워크스페이스의 환경을 위해 벽면의 불필요한 장식을 배제하고 원목 테이블과 숲색 가구만을 배치한 공간 아이덴티티 프로젝트입니다. 자연 채광이 모든 가구 표면의 나뭇결에 고르게 부딪히도록 조도와 가구 각도를 제어했습니다.", createdAt: new Date("2026-06-11T10:00:00Z").toISOString(), type: "work", bgGradient: "linear-gradient(135deg, #dfddd6, #63776a)" },

  // --- 기존 블로그 글 (Post) 데이터 25개 ---
  { id: "p4", title: "엄마에게 보내는 마지막 문자", subtitle: "전하지 못한 따뜻한 한마디", content: "엄마,\n\n나는 죽고 싶던 적이\n서른 초반에 한 번, 마흔다섯 먹은 지금,\n이렇게 두 번이 있었어요.\n\n서른 초반에 죽고 싶다 생각했을 때\n나는 그런 생각을 했어요.\n그 어릴 때 차라리 천식이 심각해서 죽어 버렸으면,\n아니 차라리 아예 태어나지 않았으면,\n내 어린 시절, 학창 시절 공부만 하던 시절과\n내 길과 내 인생 찾겠다고 혼자 발버둥 치는 지금까지\n이렇게 괴롭고 고통스럽고 외롭지는 않았겠지, 라고.\n\n이제는 나도 지치고 두려워서 죽을 용기마저 없어요.\n나도 사람들이 다 싫고 아무리 노력해도 우울감은 가시지를 않고\n그냥 이대로 죽을 때까지 외롭게 혼자라고 생각하고 살 테니까 그렇게 아세요.\n\n어차피 지금까지 혼자였는데\n이렇게 서로 없는 것처럼 산다고 크게 달라질 건 없을 것 같으니.\n\n바라는 게 하나 있다면,\n제발 남은 인생은 엄마 하고 싶은 대로 살다가 하늘 가시기를 바랍니다.\n나도 그렇게 해보려고 노력하다 죽을 테니까.\n\n건강하세요.", createdAt: new Date("2026-06-25T22:15:00Z").toISOString(), type: "post" },
  { id: "p3", title: "요즘 나의 소망", subtitle: "단순하고 고요한 삶을 꿈꾸며", content: "요즘은 많은 것들을 소유하기보다 마음의 여유를 가지는 데 더 관심이 갑니다. 복잡한 소음 속에서도 중심을 잃지 않는 단단함과 고요함을 간직하며 살아가고 싶습니다.", createdAt: new Date("2026-06-24T08:45:00Z").toISOString(), type: "post" },
  { id: "p2", title: "내게 일기라는 것", subtitle: "매일 한 페이지의 흔적 남기기", content: "일기를 쓰는 시간은 온전히 나 자신과 대화하는 시간입니다. 그날 하루 겪었던 복잡한 감정들을 털어놓고 정리하다 보면, 내일 하루를 살아갈 작은 에너지를 얻게 됩니다. 정돈되지 않은 문장이라도 좋습니다.", createdAt: new Date("2026-06-23T11:20:00Z").toISOString(), type: "post" },
  { id: "p1", title: "사랑의 정의", subtitle: "삶 속에서 발견한 따스함에 대하여", content: "사랑은 거창한 것이 아닙니다. 매일 아침 건네는 따뜻한 눈빛이나, 상대방의 소소한 일상을 궁금해하는 마음에서 시작됩니다. 이 블로그는 그러한 일상의 소소한 생각들을 담아두는 공간이 될 것입니다.", createdAt: new Date("2026-06-22T10:00:00Z").toISOString(), type: "post" },
  { id: "d20", title: "어스름해지는 저녁 하늘 아래서", subtitle: "하루를 닫는 시점의 사유", content: "창밖으로 어스름한 보랏빛 노을이 지는 것을 봅니다. 오늘 하루도 수많은 소음 속에 바쁘게 보냈지만, 이 짧은 노을의 시간이 마음속에 차분한 쉼표를 던집니다.", createdAt: new Date("2026-06-20T18:00:00Z").toISOString(), type: "post" },
  { id: "d19", title: "오래된 종이책의 질감", subtitle: "아날로그가 주는 편안함", content: "전자책의 편리함도 좋지만, 손끝에 닿는 거친 서적의 감촉과 특유의 종이 냄새는 따라갈 수 없습니다. 한 장 한 장 넘기며 느끼는 시간이 물리적인 위로를 줍니다.", createdAt: new Date("2026-06-19T14:30:00Z").toISOString(), type: "post" },
  { id: "d18", title: "커피 한 잔과 함께하는 이른 아침", subtitle: "아무도 깨지 않은 고요한 시간", content: "아직 해가 완전히 뜨기 전, 차갑고 고요한 공기 속에서 내리는 드립 커피의 향은 오감을 깨워 줍니다. 하루 중 가장 생산적이고 순수한 시간입니다.", createdAt: new Date("2026-06-18T07:15:00Z").toISOString(), type: "post" },
  { id: "d17", title: "걷기라는 위대한 단순함", subtitle: "목적지 없이 정처 없이 걷는 것", content: "머릿속이 복잡해질 때면 운동화 끈을 묶고 나섭니다. 빠른 걸음으로 바람을 맞으며 걷다 보면, 마음을 괴롭히던 생각들이 하나둘 가벼운 먼지처럼 날아갑니다.", createdAt: new Date("2026-06-17T16:40:00Z").toISOString(), type: "post" },
  { id: "d16", title: "음악이 멈춘 방 안에서", subtitle: "적막이 주는 또 다른 편안함", content: "종일 귀를 채우던 멜로디를 끄고 찾아오는 고요 속으로 걸어 들어갑니다. 아무런 진동이 없는 상태 역시 마음에 꼭 필요한 에너지 충전 방식인 듯합니다.", createdAt: new Date("2026-06-16T21:00:00Z").toISOString(), type: "post" },
  { id: "d15", title: "오래된 친구의 연락", subtitle: "무심한 듯 전해진 다정한 안부", content: "오랜만에 카카오톡으로 전달된 친구의 짤막한 안부 한마디에 피식 웃음이 납니다. 오랜 시간 보지 못했어도 어제 본 것 같은 연결감이 우리 사이에 여전합니다.", createdAt: new Date("2026-06-15T12:00:00Z").toISOString(), type: "post" },
  { id: "d14", title: "장마철의 빗소리", subtitle: "창가에 부딪히는 자연의 타악기", content: "타닥타닥 떨어지는 빗소리를 창가에서 듣고 있습니다. 마치 세상이 빗물로 씻겨 내려가는 듯한 개운함과 차분하게 가라앉는 무게감이 마음에 듭니다.", createdAt: new Date("2026-06-14T09:30:00Z").toISOString(), type: "post" },
  { id: "d13", title: "기록의 위대함", subtitle: "사라지는 생각을 묶어두는 끈", content: "휘발되는 감정과 아이디어를 글자로 적는 행위는 시간을 박제하는 것과 같습니다. 훗날 이 기록을 열어보았을 때 오늘의 나는 어떤 흔적으로 남아있을까요.", createdAt: new Date("2026-06-13T19:25:00Z").toISOString(), type: "post" },
  { id: "d12", title: "작은 화분의 새잎", subtitle: "내 방 한편에서 자라는 생명", content: "메마르던 흙 위로 작고 연한 연두색 새잎이 고개를 내밀었습니다. 보잘것없어 보이는 아주 소소한 물주기가 작은 기적을 피워낸 것 같아 감동스럽습니다.", createdAt: new Date("2026-06-12T11:00:00Z").toISOString(), type: "post" },
  { id: "d11", title: "단순해질 수 있는 용기", subtitle: "복잡함을 덜어내기", content: "우리는 너무 많은 정보와 관계 속에 매몰되어 살아갑니다. 내게 정말 중요한 소수의 가치만 남겨두고 나머지는 과감히 정리하는 지혜가 필요한 시기입니다.", createdAt: new Date("2026-06-11T15:10:00Z").toISOString(), type: "post" },
  { id: "d10", title: "시장을 헤매며 느낀 생동감", subtitle: "활기찬 사람들의 목소리", content: "재래시장에 들러 과일을 사고 국수를 먹었습니다. 바쁘게 오가는 발걸음과 왁자지껄한 소리 속에서 잊고 지내던 삶의 에너지를 듬뿍 얻고 돌아왔습니다.", createdAt: new Date("2026-06-10T14:00:00Z").toISOString(), type: "post" },
  { id: "d9", title: "서랍 정리를 시작하며", subtitle: "비우는 기쁨", content: "묵은 영수증 and 안 쓰는 잡동사니들을 쓰레기봉투에 담아 버렸습니다. 텅 빈 서랍을 보고 있자니 머릿속 공간도 함께 개운하게 비워지는 기분이 듭니다.", createdAt: new Date("2026-06-09T17:20:00Z").toISOString(), type: "post" },
  { id: "d8", title: "맛있는 요리를 대접하는 일", subtitle: "타인을 향한 따뜻한 식탁", content: "어설픈 솜씨지만 좋아하는 사람들을 위해 파스타를 만들고 테이블을 세팅했습니다. 맛있게 접시를 비워주는 모습을 보는 것만으로 배가 부릅니다.", createdAt: new Date("2026-06-08T19:50:00Z").toISOString(), type: "post" },
  { id: "d7", title: "한 걸음 늦게 걷는 지혜", subtitle: "조급함을 내려놓는 법", content: "앞서가려 애쓰다 보니 놓치는 풍경이 너무 많았습니다. 조금은 느리게 뒤따라 걸으며, 주변의 들꽃과 바람 부는 소리에 귀를 기울여 보려고 합니다.", createdAt: new Date("2026-06-07T10:40:00Z").toISOString(), type: "post" },
  { id: "d6", title: "어둠 속의 스탠드 불빛", subtitle: "오직 나와 책 한 권", content: "방 안의 모든 전등을 끄고 은은한 주황색 스탠드 하나만 켰습니다. 노란 불빛이 닿는 책장 속 활자들이 오늘 밤 나를 평화롭게 잠재워 줍니다.", createdAt: new Date("2026-06-06T23:10:00Z").toISOString(), type: "post" },
  { id: "d5", title: "가만히 응시하기", subtitle: "시선의 멈춤이 주는 통찰", content: "바삐 달리던 시선을 한곳에 멈추어 봅니다. 가로수 나뭇잎의 흔들림, 구름이 흘러가는 속도 등 가만히 보아야 비로소 보이는 것들이 참 많습니다.", createdAt: new Date("2026-06-05T13:15:00Z").toISOString(), type: "post" },
  { id: "d4", title: "단단한 마음을 가지는 법", subtitle: "휘둘리지 않는 나를 위하여", content: "타인의 평가와 무심한 시선에 쉽게 흔들리던 마음을 되돌아봅니다. 내면의 단단한 뿌리를 내리는 방법은 결국 나 자신을 있는 그대로 인정하는 것부터입니다.", createdAt: new Date("2026-06-04T16:30:00Z").toISOString(), type: "post" },
  { id: "d3", title: "산책길에서 마주친 들고양이", subtitle: "길가의 작은 이웃", content: "조용히 풀숲에 웅크려 빤히 나를 바라보는 아기 고양이를 만났습니다. 경계하면서도 호기심 어린 눈망울이 귀여워 한참 동안 눈을 맞추었습니다.", createdAt: new Date("2026-06-03T11:00:00Z").toISOString(), type: "post" },
  { id: "d2", title: "기대와 실망 사이에서", subtitle: "마음의 평온 유지하기", content: "너무 큰 기대는 실망을 낳고, 무관심은 건조함을 낳습니다. 적절한 거리를 지키며 타인과 상황을 담담하게 마주하는 중용의 태도를 길러봅니다.", createdAt: new Date("2026-06-02T14:45:00Z").toISOString(), type: "post" },
  { id: "d1", title: "새 노트를 펼치며", subtitle: "첫 페이지가 주는 무한한 설렘", content: "새하얀 빈 노트를 구매해 첫 획을 긋는 순간은 늘 벅찼습니다. 이 빈틈없는 도화지 위에 앞으로 어떤 솔직한 고민들을 채워 넣게 될까요.", createdAt: new Date("2026-06-01T22:00:00Z").toISOString(), type: "post" },
  { id: "p5", title: "prologue", subtitle: "이 공간을 시작하는 이유", content: "나만의 기록을 쌓아둘 수 있는 아주 조용하고 평온한 집을 짓기 시작했습니다. 이 공간을 방문하시는 모든 분들께도 작은 안식처가 되길 바랍니다.", createdAt: new Date("2026-06-01T10:00:00Z").toISOString(), type: "post" },
  { id: "about", title: "About June", subtitle: "사유하고 창작하는 삶에 대하여", content: "# JUNE\n경계를 넘나드는 경계인으로\n\n고교 및 대학에서 이공계에 있다가 대학 때 경영과 경제에 매료되어 금융 계열로 편입해 졸업했습니다. 이후 파이낸셜 컨설턴트를 시작으로 보험회사 콜센터 상담원, 글로벌 미스터리쇼퍼 리서치 회사 직원, IT 회사 컨텐츠 매니징 직원, 영어 혹은 수학 사교육 학원강사, 부동산 스타트업 필드마케팅팀 팀장, 컨텐츠 플랫폼 스타트업 마케팅팀 팀장, 디자인 컨설팅 회사 전략기획팀 팀장, 출판사 마케터 및 프로듀서, 창업 교육 회사 컨텐츠 마케터 및 프로덕트팀 팀장, 시네마틱 테마 스크린 사격 게임장 매장 운영 및 마케터로 여러 분야와 직군에서 일을 해왔습니다. 최근에는 농업 컨설팅&리서치 회사에서 선임연구원과 팀장을 거치며 농업 분야의 정부 정책 사업과 관련된 여러 업무를 새롭게 도전, 이후 스마트농업 사업단 기획팀에서도 잠시 근무를 했었습니다. 현재는 프리랜서로 활동하며, 미디어 및 출판 관련 서비스 창업을 준비 중입니다.\n\nㅡ motto\nㆍ모든 지식을 알고 싶기에 어떤 지식에도 얽매지 않는다\nㆍ모든 것을 소유하기 위해 어떤 것도 소유하지 않는다\nㆍ모든 것이 되고 싶기에 어떤 것도 되지 않는다\nㆍDum spiro, spero\n\n# WORKS\n경계를 넘나들던 도전의 기록\n\n건설사 로고 디자인 기획에서부터 도서 디자인 기획까지, 지역 방송 구성 작가에서 유튜브 채널 제작과 운영까지, 상세 페이지 기획에서 동네 가게 브랜딩 작업까지. 경계를 넘나들면서 분야와 분야, 아날로그와 디지털, 오프라인과 온라인, 사람과 사람을 연결할 수 있도록. 내용을 정리하고 공감과 진심을 담은 스토리텔링으로 컨텐츠, 마케팅, 브랜딩을 직접 기획하고 작업을 합니다. 개인과 조직이 지속 가능한 내일을 만드는 밑그림을 함께 고민하고 그려나갈 수 있게, 늘 선을 넘는 걸 두려워하지 않고 새로운 시도와 도전을 이어갑니다.\n\nㅡ 브랜딩 및 디자인\nㆍ크로스오버 카페-바 'Conor' 브랜딩 및 컨텐츠 작업\nㆍ로컬크리에이터생태계리포트 에디팅 및 디자인 기획\nㆍ비거게임그룹 웹사이트 리뉴얼 기획 및 디자인\nㆍ'수자타 헤나' 네이버 스토어 상세페이지 디자인 리뉴얼\nㆍ'박혜진영어연구소' 웹사이트 제작 및 운영\nㆍ'이성국제특허법률사무소' 웹사이트 리뉴얼 기획\nㆍ대한변리사회 홍보 리플렛 디자인 기획 및 카피라이팅ㄴ\nㆍ헤어샵 'Salon 6' 웹사이트 기획 및 디자인\nㆍ'(주)후니드' 웹사이트 리뉴얼 기획 및 카피라이팅\nㆍ'까뮤이앤씨' 리브랜딩 CI 디자인 및 웹사이트 기획\nㆍ‘열린협상연구소' 브랜딩 및 웹사이트 제작\nㆍ‘아이큐학교' 브랜딩 및 웹사이트 제작\n\nㅡ 마케팅 및 컨텐츠\nㆍ'스나이퍼 뱅' 컨텐츠 마케팅 디렉터\nㆍ'에스프레소바 시' 마케터 및 콘텐츠 디렉터\n출판사 '씽크스마트' 컨텐츠 마케팅 및 프로듀서\nㆍ'박과장의 조은회사 자양점' 인스타그램 콘텐츠 디렉터\nㆍ'인싸포토' 인스타그램 콘텐츠 디렉터\nㆍ'두성스포렉스' 인스타그램 콘텐츠 디렉터\nㆍ'아르어학원' 온라인 시스템 구축 관련 컨설팅\nㆍ농정원 '2019 축산스마트팜우수사례집' 기획/취재/편집\nㆍ영문법 도서 'Grammar in Use' 온라인 마케팅 총괄\nㆍ헤어디자이너 '크리스기' 유튜브 채널 기획 및 영상 제작\nㆍIT 교육업체 '인크레파스' 홍보 이미지 기획\nㆍ'북스토리' 출판사 온라인 마케팅 총괄\n\nㅡ 영상 관련\nㆍ유튜브 채널 '미스터도새기' 기획, 촬영, 편집 등 총괄\nㆍ스나이퍼뱅 클래시파이어 소개 영상 출연 및 편집\nㆍ대한검도회 온라인 어르신 검도대회/페스티벌 구성작가\nㆍ한국고등직업교육학회 '학회가 간다' 영상 편집\nㆍ제9회 생활체육 전국시도대항 검도대회 영상 편집\nㆍ2022 교육장기 육상경기대회 영상 편집\nㆍ'대머리에 꽃이 피었습니다' 오디오북 제작 영상 제작\nㆍ'(주)조흥' B2B 홍보 영상 구성작가\nㆍ'오뚜기 제유' 40주년 기념 영상 구성작가\nㆍ'하이트진로' 사내 방송 프로그램 구성작가\nㆍ한방 제품 '랑스' 홍보 영상 제작\nㆍ유튜브 채널 ‘채널 홍희연' 제작\nㆍ유튜브 채널 '즐거워효정말' 제작\nㆍ티브로드 인천 서구 '우리 동네 구석구석' 구성작가\nㆍ티브로드 인천 동구 '우리 동네 구석구석' 구성작가\nㆍ티브로드 인천 남동구 '남동 핫플레이스' 구성작가\nㆍ티브로드 인천 중구 '인천대행진' 구성작가\nㆍ티브로드 인천 중구 '중구 핫플레이스' 구성작가\nㆍ인천광역시 서구 의회 홍보 영상 구성작가\nㆍ인천광역시 중구 의회 '의정 24시' 구성작가\nㆍ인천광역시 금연캠페인 (웹드라마/30초) 구성작가\nㆍ프랜차이즈 '맛찬들' 브랜드 및 바이럴 영상 구성작가\nㆍ'(주)조흥' 60주년 기념 영상 구성작가\nㆍ헤어디자이너 '크리스기' 유튜브 채널 기획 및 제작\nㆍ평창동계올림픽 자원봉사자 교육 영상 촬영 진행 보조\n\nㅡ 도서 관련\nㆍ가벼워져서 돌아올게요 네이밍 및 기획\nㆍ사춘기 살롱 네이밍 및 디자인 기획\nㆍ중2 MVP 영어 학습법 디자인 및 편집 기획\nㆍ인턴 네이밍, 디자인, 편집 기획\nㆍ서평문집 '평' 네이밍, 디자인, 편집 기획\nㆍ이재명은 있다 네이밍, 디자인 기획\nㆍ이것이 인간관계다 네이밍 참여\nㆍ이대로 문방구를 하고 싶었다 네이밍, 디자인 기획\nㆍ5분의 혁명 감정리폼 디자인 기획\nㆍ마케팅 좀 아는 사람 네이밍, 디자인, 편집 기획\nㆍ지시 말고 질문하라 디자인, 편집 기획\nㆍ나의 뇌를 사랑해서 내가 하는 일곱 가지 에디팅, 기획\n   (독립출판 KT&G 상상마당 '어바웃 북스' 6회 참가)\n\nㅡ 수상\nㆍ국방부 6.25 전쟁 70주년 UCC 공모전 장려상\nㆍ용산전자상가 Y-Valley 도시재생 UCC 공모전 장려상\nㆍ중소기업유통센터 소소공모전 개인 부문 입선\nㆍ'시사IN' 스마트폰 사진 공모전 1월 최우수상\nㆍ머니투데이 제4회 사회경제적기업 CI 공모전 우수상\n\n# JUNEWORKS\n새로운 도전과 시도, 항상\n\n'JUNEWORKS'는 이름의 'june'에 작품, 작업물이란 뜻 of 'works'를 연결한 이름으로 개인스튜디오 명칭입니다. 기획, 컨텐츠 등 비즈니스의 시작과 성장을 위한 크리에이티브한 아이디어와 실행을 함께 돕는 회사이자 개인적으로 만든 몇 가지의 브랜드를 만들어 운영하는 회사이기도 합니다. 회사명의 가운데 만들어지는 'new'라는 단어는 스튜디오의 핵심 가치로서, 업과 분야에 있어 항상 새로운 기술을 배우고 방법을 찾으며 그걸 통한 새로운 시도를 하려 애쓰면서 계속해서 새롭게 도전하려는 태도와 의지입니다.  since 2003", createdAt: new Date("2026-06-01T09:00:00Z").toISOString(), type: "post" }
];

const getLocalPosts = (): Post[] => {
  if (typeof window === "undefined") return INITIAL_POSTS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
    return INITIAL_POSTS;
  }
  try {
    const parsed = JSON.parse(stored) as Post[];
    const targetPost = parsed.find(p => p.id === "p4");
    const hasWorkPosts = parsed.some(p => p.type === "work");
    const hasAboutPost = parsed.some(p => p.id === "about");
    const isNewAboutContent = hasAboutPost && parsed.find(p => p.id === "about")?.content.includes("고교 및 대학에서 이공계에");
    // 기존 글 개수보다 적거나, 작업 포스트 또는 소개 포스트(about)가 누락되어 있거나, 샘플 글 본문이 구버전이거나, 소개글 본문이 구버전일 시 자동 갱신
    const needsMigration = parsed.length < INITIAL_POSTS.length || !targetPost || !targetPost.content.startsWith("엄마,") || !hasWorkPosts || !hasAboutPost || !isNewAboutContent;
    if (needsMigration) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    return parsed;
  } catch (e) {
    return INITIAL_POSTS;
  }
};

const saveLocalPosts = (posts: Post[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
  }
};

// --- EXPORTED DATABASE INTERFACE ---
export const dbService = {
  // 글 목록 조회
  async getPosts(): Promise<Post[]> {
    if (isFirebaseEnabled && db) {
      try {
        const postsRef = collection(db, "posts");
        const q = query(postsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as Post[];
      } catch (error) {
        console.error("Firestore getPosts 실패, 로컬 폴백 사용:", error);
        return getLocalPosts().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
    }
    return getLocalPosts().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  // 특정 글 조회
  async getPost(id: string): Promise<Post | null> {
    if (isFirebaseEnabled && db) {
      try {
        const docRef = doc(db, "posts", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() } as Post;
        }
        return null;
      } catch (error) {
        console.error("Firestore getPost 실패, 로컬 폴백 사용:", error);
        const posts = getLocalPosts();
        return posts.find(p => p.id === id) || null;
      }
    }
    const posts = getLocalPosts();
    return posts.find(p => p.id === id) || null;
  },

  // 새 글 저장
  async createPost(postData: Omit<Post, "id" | "createdAt">): Promise<Post> {
    const createdAt = new Date().toISOString();
    if (isFirebaseEnabled && db) {
      try {
        const postsRef = collection(db, "posts");
        const docRef = await addDoc(postsRef, {
          ...postData,
          createdAt
        });
        return {
          id: docRef.id,
          ...postData,
          createdAt
        };
      } catch (error) {
        console.error("Firestore createPost 실패, 로컬 폴백 사용:", error);
      }
    }
    const posts = getLocalPosts();
    const newPost: Post = {
      id: Math.random().toString(36).substring(2, 9),
      ...postData,
      createdAt
    };
    posts.unshift(newPost);
    saveLocalPosts(posts);
    return newPost;
  },

  // 기존 글 수정
  async updatePost(id: string, postData: Partial<Omit<Post, "id" | "createdAt">>): Promise<void> {
    if (isFirebaseEnabled && db) {
      try {
        const docRef = doc(db, "posts", id);
        await updateDoc(docRef, postData);
        return;
      } catch (error) {
        console.error("Firestore updatePost 실패, 로컬 폴백 사용:", error);
      }
    }
    const posts = getLocalPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index !== -1) {
      posts[index] = { ...posts[index], ...postData };
      saveLocalPosts(posts);
    }
  },

  // 글 삭제
  async deletePost(id: string): Promise<void> {
    if (isFirebaseEnabled && db) {
      try {
        const docRef = doc(db, "posts", id);
        await deleteDoc(docRef);
        return;
      } catch (error) {
        console.error("Firestore deletePost 실패, 로컬 폴백 사용:", error);
      }
    }
    const posts = getLocalPosts();
    const filtered = posts.filter(p => p.id !== id);
    saveLocalPosts(filtered);
  }
};
