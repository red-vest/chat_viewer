import React from 'react'
import './singleMsg.scss'
import logo from '../../../image/18.png'
import logoT from '../../../image/9.png'
import { CloseCircleOutlined } from '@ant-design/icons'
import { Button, InputNumber,message } from 'antd'
import axios from 'axios'

let lastScrollTop = 0, isScroll = true

class SingleMsg extends React.PureComponent {
  constructor (props) {
    super()
    this.state = {
      top: 9999,
      left: 9999,
      userName: '',
      uid: '',
      date: 1,
      stopMsg: false,
    }
    this.StopSend = this.StopSend.bind(this)
    this.showUserTab = this.showUserTab.bind(this)
  }

  componentDidMount () {
    this.props.onRef(this)
  }

  scroll () {
    if (!isScroll) return
    setTimeout(() => {
      let ele = document.getElementById('msgList')
      ele.scrollTop = ele.scrollHeight
    }, 0)
  }

  resScroll () {
    isScroll = true
    this.scroll()
  }

  watchScroll (e) {
    return
    let clientHeight = e.target.clientHeight,
            scrollTop = e.target.scrollTop,
            scrollHeight = e.target.scrollHeight
    if (clientHeight + scrollTop - scrollHeight >= 0) {
      isScroll = true
      this.scroll()
      this.props.scrollStop(false)
    }
    if (scrollTop > lastScrollTop) {
      console.log('向下')
      lastScrollTop = scrollTop
    } else {
      isScroll = false
      this.props.scrollStop(!isScroll)
      lastScrollTop = scrollTop
    }

  }

  showUserTab (a, b) {
    this.setState({
      userName: a.u,
      uid: a.i,
      top: b.clientY + 10,
      left: b.nativeEvent.layerX + 10
    })
  }
  StopSend(){
    axios.get(`https://chat.xtjzx.cn/manager/ban?guid=${this.state.uid}&duration=${this.state.date*60<=0?3:this.state.date*60}`).then(_=>{
      message.success('禁言成功')
      this.setState({date:1,top:9999,left:9999,stopMsg:false})
      console.log(_)
    })
  }

  render () {
    const { chatList } = this.props
    return (
            <>
              <div style={{ top: this.state.top, left: this.state.left }} className={'userTab'}>
                <div className={'tabBox'}>
                  <div onClick={_ => this.setState({ top: 9999, left: 9999 })} className={'close'}>
                    <CloseCircleOutlined style={{ color: '#000000' }}/>
                  </div>
                  <div className={'userName'}>
                    {this.state.userName}
                  </div>
                  <div className={'btn'}>
                    <Button onClick={_ => this.setState({ stopMsg: !this.state.stopMsg })} type={'danger'}>{this.state.stopMsg?'取消':'禁言'}</Button>
                    {
                      this.state.stopMsg ? <><InputNumber min={0} onStep={_ => this.setState({ date: _ })}
                                                          onChange={_ => this.setState({ date: _ })}
                                                          value={this.state.date}/>分钟<Button onClick={this.StopSend} type={'primary'}>确定</Button></> : ''
                    }
                  </div>
                </div>
              </div>
              <div onScroll={this.watchScroll.bind(this)} id={'msgList'} className={'list'}>
                {chatList.map(item => {
                  return <div key={item.id} className={'singleMsg'}>
                    <img alt={'logo'} className={'logo'} src={item.s === '0' ? logo : logoT}/>
                    {
                      item.c > 0 ? <div
                              className={`tag t${item.c}`}>{item.c === 1 ? '教师' : item.c === 2 ? '助教' : '客服'}</div> : ''
                    }
                    <p onClick={_ => this.showUserTab(item, _)} className={'userName'}>{item.u}：</p>
                    <span className={'msg'}>{item.p === '1' ? item.giftMsg : ''}{item.g}</span>
                    {
                      item.p === '1' ? <img alt={'图片地址'} className={'gift'}
                                            src={require(`../../../image/g${item.f}.png`).default}/> : ''
                    }
                  </div>
                })}</div>
            </>
    )
  }
}

export default SingleMsg
