import React from 'react'
import './singleMsg.scss'
import logo from '../../../image/18.png'
import logoT from '../../../image/9.png'
import { CloseOutlined,StopOutlined } from '@ant-design/icons'
import { Button, InputNumber, Tooltip, message, Popover,Modal } from 'antd'
import axios from 'axios'
import config from '../../../config'

let lastScrollTop = 0, isScroll = true

// let fn = () => {
//   return (
//           <div onClick={_ => _.stopPropagation()}><InputNumber style={{ width: '150px', marginRight: '10px' }} min={1}
//                                                                onStep={_ => this.setState({ date: _ })}
//                                                                onChange={_ => this.setState({ date: _ })}
//                                                                value={this.state.date} addonAfter="分钟"/>
//             <Button onClick={this.StopSend} type={'primary'}>确定</Button> <Tooltip title="关闭窗口"><Button
//                     onClick={_ => this.setState({ visible: '' })} icon={<CloseOutlined/>}/></Tooltip></div>
//   )
// }

class SingleMsg extends React.PureComponent {
  constructor (props) {
    super()
    this.state = {
      userName: '',
      uid: '',
      date: 5,
      visible: '',
      showModal:false,
      stopMsg: false,
    }
    this.StopSend = this.StopSend.bind(this)
    this.showUserTab = this.showUserTab.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleOk = this.handleOk.bind(this)
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
    if(config.mode===2)return
    if (a.s==='1'){
      message.info('近支持新途径在线')
      return
    }
    this.setState({
      visible: a.id,
      userName: a.u,
      uid: a.i,
    })
    b.stopPropagation()
  }

  StopSend () {
    axios.get(`https://chat.xtjzx.cn/chat-manager/ban?less_id=${this.props.lessonId}&guid=${this.state.uid}&duration=${this.state.date * 60 <= 0 ? 3 : this.state.date * 60}`).then(_ => {
      message.success('禁言成功')
      this.setState({ date: 1, visible: '',showModal:false, stopMsg: false })
      this.props.updateBanList()
    })
  }
  handleOk(){

  }
  handleCancel(){
    this.setState({showModal:false})
  }
  render () {
    const { chatList } = this.props
    const { userName } = this.state
    return (
            <>
              <div onScroll={this.watchScroll.bind(this)} onClick={_ => this.setState({ visible: '' })} id={'msgList'}
                   className={'list'}>
                {chatList.map(item => {
                  return <div key={item.id} className={'singleMsg'}>
                    <img alt={'logo'} className={'logo'} src={item.s === '0' ? logo : logoT}/>
                    {
                      item.c > 0 ?
                              <div className={`tag t${item.c}`}>
                                {item.c === 1 ? '教师' : item.c === 2 ? '助教' : '客服'}
                              </div> : ''
                    }
                    <Popover visible={this.state.visible === item.id}
                             trigger="click"
                             content={() => <div style={{display:'flex',flexDirection:'column'}}>
                               <Button onClick={_=>this.setState({showModal:true})} style={{textAlign:'right'}} icon={<StopOutlined />} type="text">屏蔽</Button>
                               <Button onClick={_=>this.props.setReply(item)} style={{textAlign:'right'}} type="text">回复</Button>
                             </div>}>
                      {item.s==='1'?<p className={'userName'}>{item.i+'-'+item.u}：</p>
                              :<p onClick={_ => this.showUserTab(item, _)} className={'userName'}>{item.i+'-'+item.u}：</p>}
                    </Popover>
                    {
                      item.to!==null?<span style={{color:'blue'}}>@{item.to.u}</span>:''
                    }
                    <span className={'msg'}>{item.p === '1' ? item.giftMsg : ''}{item.g}</span>
                    {
                      item.p === '1' ? <img alt={'图片地址'} className={'gift'}
                                            src={require(`../../../image/g${item.f}.png`).default}/> : ''
                    }
                  </div>
                })}</div>
              <Modal cancelText={'取消'} okText={'确定'} title={'屏蔽'+userName} visible={this.state.showModal} onOk={this.StopSend} onCancel={this.handleCancel}>
                <div onClick={_ => _.stopPropagation()}><InputNumber addonBefore={'该用户将在'} style={{ textAlign:'center' }} min={1}
                                                                                onStep={_ => this.setState({ date: _ })}
                                                                               onChange={_ => this.setState({ date: _ })}
                                                                                value={this.state.date} addonAfter="分钟内，无法参与当前直播课程的互动"/></div>
              </Modal>
            </>
    )
  }
}

export default SingleMsg
