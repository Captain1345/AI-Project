"use client";

import { useParams, useRouter } from 'next/navigation';

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  console.log("ROUTER",params);
  //const { conversationId } = router.query;

  return (
    <div>
      <h1>Conversation ID:  {params.conversationId}</h1>
      {/* Add your UI components here */}
    </div>
  );
}