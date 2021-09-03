import React from 'react'
import './singleMsg.scss'

function SingleMsg (props) {
  return (
          <div id={'msgList'} className={'list'}>
            {props.chatList.map(item => {
              return <div key={item.id} className={'singleMsg'}>{item.c > 0 ? <div
                      className={'tag'}>{item.c === 1 ? '教师' : item.c === 2 ? '助教' : '客服'}</div> : ''}<p
                      className={'userName'}>{item.u}：</p><span>{item.p==1?'赠送了':''}{item.g}</span></div>
            })}</div>
  )
}

export default SingleMsg
