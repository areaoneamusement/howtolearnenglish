export type Word = {
  english: string;
  vietnamese: string;
  pronunciation: string;
};

export type Topic = {
  id: string;
  name: string;
  icon: string;
  color: string;
  words: Word[];
};

export const topics: Topic[] = [
  {
    id: 'greetings',
    name: 'Chào hỏi',
    icon: '👋',
    color: '#4CAF50',
    words: [
      { english: 'Hello', vietnamese: 'Xin chào', pronunciation: 'heh-loh' },
      { english: 'Goodbye', vietnamese: 'Tạm biệt', pronunciation: 'good-bai' },
      { english: 'Thank you', vietnamese: 'Cảm ơn', pronunciation: 'thenk-yuu' },
      { english: 'Please', vietnamese: 'Làm ơn', pronunciation: 'pliiz' },
      { english: 'Sorry', vietnamese: 'Xin lỗi', pronunciation: 'so-ri' },
      { english: 'Yes', vietnamese: 'Vâng / Có', pronunciation: 'yes' },
      { english: 'No', vietnamese: 'Không', pronunciation: 'noh' },
      { english: 'Good morning', vietnamese: 'Chào buổi sáng', pronunciation: 'gud mor-ning' },
      { english: 'Good night', vietnamese: 'Chúc ngủ ngon', pronunciation: 'gud nait' },
      { english: 'How are you?', vietnamese: 'Bạn có khỏe không?', pronunciation: 'hau ar yuu' },
    ],
  },
  {
    id: 'numbers',
    name: 'Số đếm',
    icon: '🔢',
    color: '#2196F3',
    words: [
      { english: 'One', vietnamese: 'Một', pronunciation: 'wʌn' },
      { english: 'Two', vietnamese: 'Hai', pronunciation: 'tuː' },
      { english: 'Three', vietnamese: 'Ba', pronunciation: 'θriː' },
      { english: 'Four', vietnamese: 'Bốn', pronunciation: 'fɔːr' },
      { english: 'Five', vietnamese: 'Năm', pronunciation: 'faɪv' },
      { english: 'Six', vietnamese: 'Sáu', pronunciation: 'sɪks' },
      { english: 'Seven', vietnamese: 'Bảy', pronunciation: 'ˈsev-ən' },
      { english: 'Eight', vietnamese: 'Tám', pronunciation: 'eɪt' },
      { english: 'Nine', vietnamese: 'Chín', pronunciation: 'naɪn' },
      { english: 'Ten', vietnamese: 'Mười', pronunciation: 'ten' },
    ],
  },
  {
    id: 'colors',
    name: 'Màu sắc',
    icon: '🎨',
    color: '#9C27B0',
    words: [
      { english: 'Red', vietnamese: 'Đỏ', pronunciation: 'red' },
      { english: 'Blue', vietnamese: 'Xanh dương', pronunciation: 'bluː' },
      { english: 'Green', vietnamese: 'Xanh lá', pronunciation: 'ɡriːn' },
      { english: 'Yellow', vietnamese: 'Vàng', pronunciation: 'ˈyel-oh' },
      { english: 'White', vietnamese: 'Trắng', pronunciation: 'waɪt' },
      { english: 'Black', vietnamese: 'Đen', pronunciation: 'blæk' },
      { english: 'Orange', vietnamese: 'Cam', pronunciation: 'ˈɔːr-ɪndʒ' },
      { english: 'Purple', vietnamese: 'Tím', pronunciation: 'ˈpɜːr-pəl' },
      { english: 'Pink', vietnamese: 'Hồng', pronunciation: 'pɪŋk' },
      { english: 'Brown', vietnamese: 'Nâu', pronunciation: 'braʊn' },
    ],
  },
  {
    id: 'food',
    name: 'Đồ ăn & Uống',
    icon: '🍜',
    color: '#FF5722',
    words: [
      { english: 'Rice', vietnamese: 'Cơm / Gạo', pronunciation: 'raɪs' },
      { english: 'Water', vietnamese: 'Nước', pronunciation: 'ˈwɔː-tər' },
      { english: 'Milk', vietnamese: 'Sữa', pronunciation: 'mɪlk' },
      { english: 'Bread', vietnamese: 'Bánh mì', pronunciation: 'bred' },
      { english: 'Apple', vietnamese: 'Táo', pronunciation: 'ˈæp-əl' },
      { english: 'Banana', vietnamese: 'Chuối', pronunciation: 'bəˈnɑː-nə' },
      { english: 'Egg', vietnamese: 'Trứng', pronunciation: 'eɡ' },
      { english: 'Chicken', vietnamese: 'Gà', pronunciation: 'ˈtʃɪk-ɪn' },
      { english: 'Fish', vietnamese: 'Cá', pronunciation: 'fɪʃ' },
      { english: 'Coffee', vietnamese: 'Cà phê', pronunciation: 'ˈkɒf-i' },
    ],
  },
];
