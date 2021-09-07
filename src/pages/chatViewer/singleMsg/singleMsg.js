import React from 'react'
import './singleMsg.scss'
import logo from '../../../image/18.png'
import logoT from '../../../image/9.png'

class SingleMsg extends React.PureComponent {
  render () {
    const { chatList } = this.props
    return (
            <div id={'msgList'} className={'list'}>
              {chatList.map(item => {
                return <div key={item.id} className={'singleMsg'}>
                  <img className={'logo'} src={item.s==='0'?logo:logoT}/>
                  {
                    item.c > 0
                            ? <div className={'tag'}>{item.c === 1 ? '教师' : item.c === 2 ? '助教' : '客服'}</div>
                            : ''
                  }
                  <p className={'userName'}>{item.u}：</p>
                  <span className={'msg'}>{item.p === '1' ? item.giftMsg : ''}{item.g}</span>
                  {
                    item.p==='1'? <img className={'gift'} src={require(`../../../image/g${item.f}.png`).default}/>:''
                  }
                </div>
              })}</div>
    )
  }
}

export default SingleMsg
