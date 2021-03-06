import React from 'react'
import './chatViewer.scss'
import io from 'socket.io-client'
import config from '../../config'
import SingleMsg from './singleMsg/singleMsg'
import LivePlay from './livePlay/livePlay'
import PlayControl from './playControl/playControl'
import Axios from 'axios'
import { Row, Col, message, Modal, Button, Input, Radio, List, Typography, Divider, Switch, Popconfirm } from 'antd'
import axios from 'axios'
import { CheckOutlined, MoreOutlined, CloseOutlined } from '@ant-design/icons'

const { TextArea } = Input
let num = 0
let banListInter = undefined;
let maxChat = 100
let replyUser = null;

let socket = null, socketTwo = null, move = false, offSetX = 0

function gql (query) {
  return query[0]
}

class ChatViewer extends React.PureComponent {
  constructor () {
    super()
    this.state = {
      chatList: [],
      banList: [],
      inputMsg: '',
      count: 0,
      hot: 0,
      lessonId: '',
      uid: '',
      oldCount: 0,
      oldHot: 0,
      liveUrl: '',
      socket: undefined,
      mobile: '',
      pwd: '',
      courseList: [],
      showStop: false,
      username: '',
      loginVisible: false,
      avatar: '',
      width: '',
      playWidth: 400,
      add: false,
      notice: '',
      allBanState: false,
      oldNotice: '',
      selectNotice: '1'
    }
    this.changeCourse = this.changeCourse.bind(this)
    this.init = this.init.bind(this)
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.showLogin = this.showLogin.bind(this)
    this.drag = this.drag.bind(this)
    this.getNotice = this.getNotice.bind(this)
    this.msgRef = this.msgRef.bind(this)
    this.scrollStop = this.scrollStop.bind(this)
    this.resScroll = this.resScroll.bind(this)
    this.getBanList = this.getBanList.bind(this)
    this.setAllBan = this.setAllBan.bind(this)
    this.unBan = this.unBan.bind(this)
    this.setReply = this.setReply.bind(this)
  }

  componentDidMount () {
    this.setState({
      width: document.body.offsetWidth,
      avatar: window.sessionStorage.getItem('avatar'),
      username: window.sessionStorage.getItem('nickName'),
      uid: window.sessionStorage.getItem('token') || ''
    })
    window.addEventListener('resize', _ => {
      this.setState({ width: document.body.offsetWidth })
    })
    document.addEventListener('mouseup', _ => {
      this.endDrag(_)
    })
    document.addEventListener('mousemove', _ => {
      this.drag(_)
    })
    this.getCourseList()
  }

  msgRef (ref) {
    this.singleMsg = ref
  }

  init (courseId, lessonId, channel, uid, username, channelId) {
    const data = {
      forceNew: true,
      reconnectionDelay: 2000,
      timeout: 10000,
      autoconnect: true,
      transports: ['websocket'],
      query: {
        courseId,
        lessonId,
        uid,
        channel,
        username,
      }
    }
    if (socket !== null) {socket.close()}
    if (socketTwo !== null) {socketTwo.close()}
    socket = io(config.ioUrl, data)
    this.setState({ socket })
    socketTwo = io('https://wss.xintujing.cn/chat', {
      transports: ['websocket']
    })
    socketTwo.on('connect', _ => {
      let charRoomLoginInfo = {
        userId: ``,
        room: channelId,
        username: ``,
        level: '4'
      }
      socketTwo.emit('login', charRoomLoginInfo)
      socketTwo.on('login', _ => {
        if (num <= 0) {
          socketTwo.emit('heat')
          socketTwo.emit('received message')
          socketTwo.emit('receive flower')
          socketTwo.emit('get all main point')
          socketTwo.emit('get announcement')
          socketTwo.emit('get banned time')
          socketTwo.emit('get question')
          num += 1
        }
      })
    })
    socket.on('connect', _ => {
      message.success('????????????')
    })
    socket.on('disconnect', _ => {
      console.log(_)
    })
    socket.on('notify', _ => {
      this.setState({ notice: _ })
    })
    socket.on('connect_error', _ => {
      console.log(_)
    })
    socket.on('error', _ => {
      console.log(_)
    })
    socket.on('connect_timeout', _ => {
      console.log(_)
    })
    socket.on('con_error', _ => {
      message.error(_ + '????????????????????????')
    })
    socket.on('user join', _ => {
      console.log(_)
    })
    socket.on('user leave', _ => {
      console.log(_)
    })
    socket.on('heat', _ => {
      this.setState({ hot: _ })
    })
    socketTwo.on('heat', _ => {
      this.setState({ oldHot: _ })
    })
    socket.on('msg', e => {
      let obj = {}
      obj.id = Math.random().toString().substr(2) + new Date().getTime()
      obj.g = e.m.g
      obj.p = e.m.p
      obj.f = e.m.f || ''
      obj.to = e.m.t||null
      obj.u = e.u
      obj.giftMsg = '?????????'
      obj.c = e.c
      obj.i = e.i
      obj.s = '0'
      let tempList = [...this.state.chatList, obj]
      if (tempList.length > maxChat) {
        tempList.splice(0, tempList.length - maxChat)
      }
      this.setState({ chatList: tempList }, _ => {
        this.singleMsg.scroll()
      })
    })
    socketTwo.on('received message', _ => {
      let obj = {}
      obj.id = Math.random().toString().substr(2) + new Date().getTime()
      obj.g = _.msg
      obj.p = '0'
      obj.i=  obj.i = _.user.userId
      obj.u = _.user.username
      obj.c = _.user.level === '2' ? 2 : _.user.level === '3' ? 3 : 0
      obj.s = '1'
      let tempList = [...this.state.chatList, obj]
      if (tempList.length > maxChat) {
        tempList.splice(0, tempList.length - maxChat)
      }
      this.setState({ chatList: tempList }, _ => {
        this.singleMsg.scroll()
      })
    })
    socketTwo.on('get announcement', _ => {
      this.setState({ oldNotice: _.msg })
    })
    socketTwo.on('receive announcement', _ => {
      this.setState({ oldNotice: _.msg })
    })

    socketTwo.on('receive flower', _ => {
      let obj = {}
      obj.id = Math.random().toString().substr(2) + new Date().getTime()
      obj.g = '??????'
      obj.p = '1'
      obj.giftMsg = '????????????'
      obj.i = _.user.userId
      obj.u = _.user.username
      obj.c = 0
      obj.s = '1'
      obj.f = '5'
      let tempList = [...this.state.chatList, obj]
      if (tempList.length > maxChat) {
        tempList.splice(0, tempList.length - maxChat)
      }
      this.setState({ chatList: tempList }, _ => {
        this.singleMsg.scroll()
      })
    })
    socketTwo.on('interaction number', _ => {
      let obj = {}
      obj.id = Math.random().toString().substr(2) + new Date().getTime()
      obj.g = _.type === 0 ? '?????????' : _.type === 1 ? '?????????' : '?????????'
      obj.p = '1'
      obj.giftMsg = ''
      obj.i = _.user.userId
      obj.u = _.user.username
      obj.f = _.type === 0 ? 'lsh' : _.type === 1 ? 'mbl' : 'hbd'
      obj.c = 0
      obj.s = '1'
      let tempList = [...this.state.chatList, obj]
      if (tempList.length > maxChat) {
        tempList.splice(0, tempList.length - maxChat)
      }
      this.setState({ chatList: tempList }, _ => {
        this.singleMsg.scroll()
      })
    })
    socket.on('count', _ => {
      this.setState({ count: _ })
    })
    socketTwo.on('online count', _ => {
      this.setState({ oldCount: _ })
    })
  }

  scrollStop (bool) {
    this.setState({ showStop: bool })
  }

  async getCourseList () {
    let result = await Axios.get('https://api.xtjzx.cn/course_manager/api/course/list')
    // let resultT = []
    let list = [...result.data.data]
    list.forEach(item => {
      item.name = item.Id + '-' + item.CourseName
    })
    this.setState({ courseList: list })
    return ''
  }

  async getNotice (id = '') {
    let result = await axios.post('https://api.xtjzx.cn/index', {
      operationName: 'CourseNoticeInfo',
      query: gql`
          query CourseNoticeInfo($id:Long){
              CourseNoticeInfo(input: {id: $id}){
                  noticeInfo{
                      content
                  }
              }
          }
      `,
      variables: { id }
    })
    this.setState({ notice: result.data.data.data.CourseNoticeInfo.noticeInfo.content })
  }

  async login (mobile = this.state.mobile, pwd = this.state.pwd) {
    let result = await Axios.post('https://api.xtjzx.cn/user/login/', {
      operationName: 'LoginByAccount',
      query: gql`
          query LoginByAccount($appCode:Int,$mobile:String,$pwd:String){
              LoginByAccount(input:{appCode:$appCode,mobile:$mobile,pwd:$pwd}){
                  nickName
                  avatar
                  token
                  userType
              }
          }
      `,
      variables: { appCode: 104, mobile, pwd }
    }).catch((err) => {return Promise.reject(err)})
    if (result.data.code === '400') {
      message.error(result.data.msg)
      return
    }
    message.success('????????????')

    const { nickName, token, avatar, userType } = result.data.data.data.LoginByAccount
    window.sessionStorage.setItem('token', token)
    window.sessionStorage.setItem('avatar', avatar)
    window.sessionStorage.setItem('nickName', nickName)
    this.setState({
      uid: token,
      username: nickName,
      loginVisible: false,
      avatar: avatar,
      mobile: '',
      pwd: ''
    })
  }

  async logout () {
    this.setState({ uid: '',lessonId:'', mobile: '', pwd: '', liveUrl: '', chatList: [], hot: 0, count: 0 })
    try {
      socket.close()
    } catch (e) {}
    sessionStorage.clear()
    message.success('????????????')
  }

  showLogin () {
    this.setState({ loginVisible: true })
  }

  sendMsg () {
    if (this.state.inputMsg === '') return
    if(replyUser===null){
      socket.emit('msg', { g: this.state.inputMsg, p: '0' })
    }else {
      let msg = {
        g: this.state.inputMsg.replace('@'+replyUser['u'],''),
        t:replyUser,
        p: '0'
      }
      socket.emit('msg', msg)
      replyUser = null
    }
    this.setState({ inputMsg: '' })
  }

  async changeCourse (e) {
    let result = await Axios.post('https://api.xtjzx.cn/index', {
      operationName: 'chapterListCached',
      query: '???    query chapterListCached($courseId:Long){???        chapterListCached(input:{courseId: $courseId}){???' +
              '            chapter{???                chapterName???                courseId???                id???                chapterLesson{???                    chapterId???                    id???                    liveStatus???                    name???                    openTime???                    lowQualityUrl???                    normalQualityUrl???                    highQualityUrl???                    chatHistory???                }???            }???        }???    }???    ',
      variables: {
        courseId: e.toString()
      }
    })
    let list = result.data.data.data.chapterListCached.chapter
    let lessonId = 0
    list.forEach(item => {
      if (item.chapterLesson !== undefined && item.chapterLesson.length > 0) {
        item.chapterLesson.forEach(i => {
          if (i.liveStatus === 1) {
            lessonId = i.id
          }
        })
      }
    })
    if (lessonId === 0) {
      message.info('???????????????????????????')
      this.setState({ liveUrl: '', chatList: [],lessonId:'', hot: 0, count: 0,notice:'' })
      try {
        if (socket !== null) {socket.close()}
        if (socketTwo !== null) {socketTwo.close()}
      }catch (e) {}
      return
    }
    let url = await Axios.post('https://api.xtjzx.cn/index', {
      operationName: 'GetCourseVideo',
      query: '???    query GetCourseVideo($courseId:Long,$lessonId:Long){???        getCourseVideo(input:' +
              ' {courseId:$courseId,lessonId: $lessonId}){???            courseLive{???                avChatRoomId???                channelId???                name???                playUrl???            }???            courseVideo{???                chatHistory???                lowQualityUrl???                normalQualityUrl???                highQualityUrl???            }???        }???    }',
      variables: { lessonId, courseId: e.toString() },
    })
    await this.getNotice(e.toString())
    let data = url.data.data.data.getCourseVideo.courseLive
    this.setState({
      lessonId,
      channelId: data.avChatRoomId,
      liveUrl: url.data.data.data.getCourseVideo.courseLive.playUrl,
      courseId: e.toString()
    })
    this.getBanState(data.avChatRoomId)
    this.getBanList(lessonId)
    clearInterval(banListInter)
    banListInter = setInterval(_=>{
      this.getBanList(lessonId)
    },1000*60)
    this.init(e, lessonId, data.avChatRoomId, this.state.uid, this.state.username, data.channelId)
  }

  startDrag (e) {
    move = true
    offSetX = e.nativeEvent.offsetX
  }

  resScroll () {
    this.singleMsg.resScroll()
  }

  endDrag () {
    move = false
  }

  async getBanList (lessonId = this.state.lessonId) {
    let result = await axios.get('https://chat.xtjzx.cn/chat-manager/list?less_id=' + lessonId)
    this.setState({ banList: result.data.data })
  }

  async unBan (uid) {
    axios.get(`https://chat.xtjzx.cn/chat-manager/unban?less_id=${this.state.lessonId}&guid=${uid}`).then(_ => {
      message.success('????????????')
      this.getBanList()
    })
  }
  setReply(data){
    replyUser = data;
    let u = data.u;
    this.setState({inputMsg:`@${u} `})
  }
  async setAllBan (bool) {
    if (this.state.channelId === undefined) return
    let url = bool ? 'https://chat.xtjzx.cn/chat-manager/channel-ban?channel=' : 'https://chat.xtjzx.cn/chat-manager/channel-unban?channel='
    await axios.get(url + this.state.channelId)
    message.success(`${bool ? '????????????' : '??????????????????'}`)
    await this.getBanState(this.state.channelId)
  }

  async getBanState (channelId) {
    if (channelId === undefined) return
    let result = await axios.get('https://chat.xtjzx.cn/chat-manager/channel-status?channel=' + channelId)
    this.setState({ allBanState: result.data.data !== null })
  }

  drag (e) {
    if (move) {
      let pageX = e.pageX
      this.setState({ playWidth: pageX - offSetX })
    }
  }

  render () {

    return (
            <div style={{alignItems:config.mode===1?'center':''}} className={'all'}>
              {config.mode===1?'':
                      <div className={'drag'} onMouseDown={this.startDrag.bind(this)}  style={{ left: this.state.playWidth + 'px' }}/>}
              <div className={'chatBox'}>
                <div className={'livePlay'} style={{ width: this.state.playWidth + 'px' }}>
                  <div className={'live'}>
                    <LivePlay id={'courseOne'} liveUrl={this.state.liveUrl}/>
                  </div>

                  <PlayControl logout={this.logout} id={this.state.courseId} oldHot={this.state.oldHot}
                               avatar={this.state.avatar} nickName={this.state.username} oldCount={this.state.oldCount}
                               showLogin={this.showLogin}
                               uid={this.state.uid} selectLive={this.changeCourse}
                               hot={this.state.hot} num={this.state.count} courseList={this.state.courseList}/>
                  {
                    config.mode===1? this.state.lessonId===''?'':<div className={'noticeSet'}>
                      <h3>????????????</h3>
                      <div style={{
                        color: 'red',
                        fontSize: '16px',
                        display: 'inline-block',
                        marginRight: '5px'
                      }}>??????????????????????????????
                      </div>
                      <Switch
                              checked={this.state.allBanState}
                              onChange={e => this.setAllBan(e)}
                              checkedChildren={<CheckOutlined/>}
                              unCheckedChildren={<CloseOutlined/>}
                      />
                    </div>:''
                  }
                </div>
                <div className={'chat'} style={{ width:config.mode===1?`650px`:`calc(100% - ${this.state.playWidth}px)`}}>
                  {
                    this.state.showStop ? <div onClick={this.resScroll} className={'stopScroll'}>??????????????????????????????</div> : ''
                  }
                  <div className={'gg'}>
                    <Radio.Group defaultValue="1" size={'small'}
                                 onChange={_ => this.setState({ selectNotice: _.target.value })}>
                      <Radio.Button value="1">???????????????</Radio.Button>
                      <Radio.Button value="2">???????????????</Radio.Button>
                    </Radio.Group>
                    <div className={'notice'}>
                      {this.state.selectNotice === '1' ? this.state.notice : this.state.oldNotice}
                    </div>
                  </div>
                  <SingleMsg setReply={this.setReply} updateBanList={this.getBanList} lessonId={this.state.lessonId} scrollStop={this.scrollStop}
                             onRef={this.msgRef}
                             chatList={this.state.chatList}/>
                  {
                    config.mode===1?
                      this.state.lessonId===''?'':<div className={'msgSet'}>
                        <TextArea placeholder={'????????????'} style={{ width: '550px' }} showCount
                                  onChange={_ => {
                                    if(replyUser!==null){
                                      let arr = _.target.value.split(' ')
                                      if('@'+replyUser.u!==arr[0]){
                                        replyUser = null;
                                        this.setState({inputMsg: _.target.value.replace(arr[0],'')})
                                      }else {
                                        this.setState({ inputMsg: _.target.value })
                                      }
                                    }else {
                                      this.setState({ inputMsg: _.target.value })
                                    }
                                  }} value={this.state.inputMsg}/>
                        <Button onClick={this.sendMsg.bind(this)} style={{ marginTop: '5px' }} type="primary">??????</Button>
                      </div>:''

                  }
                </div>
                {
                  config.mode===1?  <div className={'blockList'}>
                    <div className={'b-list'}>
                      <Divider orientation="left">??????????????????????????????</Divider>
                      <List
                              style={{ background: '#ffffff' }}
                              size="small"
                              bordered={false}
                              dataSource={this.state.banList}
                              renderItem={item => <List.Item>
                                <div className={'singleBanUser'}>{item.uid}
                                  <Popconfirm
                                          title="?????????????????????????????????"
                                          onConfirm={_=>this.unBan(item.uid)}
                                          okText="??????"
                                          cancelText="??????"
                                  >
                                    <Button type="text" shape="circle" icon={<MoreOutlined/>}/>
                                  </Popconfirm>
                                </div>
                              </List.Item>}
                      />
                    </div>
                  </div>:''
                }
              </div>
              <Modal
                      title={'??????'}
                      onCancel={() => this.setState({ loginVisible: false })}
                      visible={this.state.loginVisible}
                      footer={
                        this.state.uid === '' ?
                                [
                                  <Button onClick={() => this.setState({ loginVisible: false })} key="back">??????</Button>,
                                  <Button onClick={_ => this.login()} type="primary" key="login">??????</Button>
                                ] : [
                                  <Button onClick={() => this.setState({ loginVisible: false })} key="back">??????</Button>,
                                  <Button onClick={_ => this.logout()} type="danger" key="exit">??????</Button>,
                                ]}
              >{
                this.state.uid === '' ? <Row align={'middle'}>
                  <Col style={{ textAlign: 'right' }} span={3}>????????????</Col><Col span={20}><Input
                        onChange={e => this.setState({ mobile: e.target.value })} value={this.state.mobile} allowClear/></Col>
                  <div style={{ height: '5px', width: '100%' }}/>
                  <Col style={{ textAlign: 'right' }} span={3}>?????????</Col><Col span={20}><Input
                        onChange={e => this.setState({ pwd: e.target.value })} value={this.state.pwd}
                        allowClear
                        type={'password'}/></Col>
                </Row> : ''
              }
              </Modal>
            </div>
    )
  }
}

export default ChatViewer
