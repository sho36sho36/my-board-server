'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. Supabaseクライアントの初期化（サーバーとの接続窓口）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// データの型定義
interface Post {
  id: number;
  content: string;
  created_at: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  // 2. データベースからデータを読み込む関数（Read）
  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false }); // 新しい順に並び替え

    if (error) {
      console.error('データ取得エラー:', error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  // 画面が開いたときに一度だけデータを読み込む
  useEffect(() => {
    fetchPosts();
  }, []);

  // 3. データベースにデータを書き込む関数（Create）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const { error } = await supabase
      .from('posts')
      .insert([{ content: inputText }]);

    if (error) {
      console.error('書き込みエラー:', error);
      alert('送信に失敗しました');
    } else {
      setInputText(''); // 入力欄を空にする
      fetchPosts();     // 最新のデータに更新する
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center border-b pb-4">
        🌐 仮想自作掲示板サーバー
      </h1>

      {/* 投稿フォーム */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="ここにメッセージを入力..."
          className="flex-1 border p-2 rounded-lg text-black"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          送信
        </button>
      </form>

      {/* 投稿一覧表示 */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg">みんなの書き込み一覧</h2>
        {loading ? (
          <p className="text-gray-500">読み込み中...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500">まだ書き込みはありません。</p>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <div key={post.id} className="border p-3 rounded-lg bg-gray-800 text-white">
                <p>{post.content}</p>
                <span className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleString('ja-JP')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
