import React from 'react'
import { useChatContext } from '../hooks/useChatContext'
import { useAuthContext } from '../hooks/useAuthContext';
import { useFetchRecipientUser } from '../hooks/useFetchRecipientUser';
import { Stack } from 'react-bootstrap';
import moment from 'moment';

export const ChatBox = () => {
  const { user } = useAuthContext();
  const { messages, isMessagesLoading, currentChat } = useChatContext();
  const { recipientUser } = useFetchRecipientUser(currentChat, user);  

  if (!recipientUser) {
    return <p> select a conversation </p>
  }

  if (isMessagesLoading) {
    return <p> loading chat... </p>
  }

  return (
    <>
      <Stack className='chat-box live-chat-overflow' gap={4}>
        <div className="chat-header">
          <strong>{recipientUser.name}</strong>
        </div>
        <Stack className='chat-messages live-chat-overflow' gap={3}>
          {
            messages && messages.map((message, index) => {
              return (
                <Stack className={`${message?.senderId === user?._id ? "message self align-self-end flex-grow-0" : "message align-self-start flex-grow-0"}`} key={index}>
                  <span>{message.text}</span>
                  <span className='message-footer'>{moment(message.createdAt).calendar()}</span>
                </Stack>
              )
            })
          }
        </Stack>
      </Stack>
    </>
  )
}
