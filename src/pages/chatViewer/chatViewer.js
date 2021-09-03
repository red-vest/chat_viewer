import React, { useEffect, useState } from 'react'
import './chatViewer.scss'
import io from 'socket.io-client'
import config from '../../config'
import SingleMsg from './singleMsg'
import Axios from 'axios';
import { Row, Col, Select,message } from 'antd'
const { Option } = Select;
let socket = null

function getQuery(name=''){
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  let r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return decodeURIComponent(r[2])
  }
  return ''
}

class ChatViewer extends React.Component {
  constructor () {
    super()
    this.state = {
      courseId: '99999999',
      lessonId: '99999997',
      uid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJndWlkIjoiMTAwMDgyMDg1MSIsImV4cCI6MTYzMTE4ODgwMCwiaXNzIjoidXNlcl9jZW50ZXIifQ.T5C7-Mb46KtfJDgBiTe_PEVf87ZglwsMGUBWuGV6iSs',
      channel: 'live-test-999',
      username: '',
      chatList: [],
      count: 0,
      hot: 0,
      courseList:[]
    }
    this.changeCourse = this.changeCourse.bind(this)
    this.init = this.init.bind(this)
  }



  componentDidMount () {
    this.getCourseList()
  }
  init(courseId,lessonId,channel){
    const data = {
      forceNew: true,
      reconnectionDelay: 2000,
      timeout: 10000,
      autoconnect: true,
      transports: ['websocket'],
      query: {
        courseId,
        lessonId,
        uid: this.state.uid,
        channel,
        username: this.state.username
      }
    }
    if (socket !== null) {socket.close()}
    socket = io(config.ioUrl, data)
    socket.on('connect', _ => {
      alert('连接成功')
    })
    socket.on('disconnect', _ => {
      console.log(_)
    })
    socket.on('notify', _ => {
      console.log(_)
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
      console.log(_)
    })
    socket.on('user join', _ => {
      console.log(_)
    })
    socket.on('user leave', _ => {
      console.log(_)
    })
    socket.on('heat', _ => {
      console.log(_)
      this.setState({ hot: _ })
    })
    socket.on('msg', e => {
      let obj = {}
      obj.id = Math.random().toString().substr(2) + new Date().getTime()
      obj.g = e.m.g
      obj.p = e.m.p
      obj.f = e.m.f || ''
      obj.u = e.u
      obj.c = e.c.toString()
      obj.i = e.i
      this.setState({ chatList: [...this.state.chatList, obj] })
      setTimeout(() => {
        let ele = document.getElementById('msgList')
        console.log(ele.scrollHeight)
        ele.scrollTop = ele.scrollHeight
      }, 0)
    })
    socket.on('count', _ => {
      console.log(_)
      this.setState({ count: _ })
    })
  }
  async getCourseList(){
    let result = await Axios.get('https://api.xtjzx.cn/course_manager/api/course/list?course_status=1&is_close=1')
    let list = result.data.data;
    list.forEach(item=>{
      item.name = item.Id+'-'+item.CourseName
    })
    this.setState({courseList:list})
    return ''
  }

  async changeCourse(e){
    console.log(e)
    let result = await Axios.post('https://api.xtjzx.cn/index',{
      operationName: "chapterListCached",
      query: "↵    query chapterListCached($courseId:Long){↵        chapterListCached(input:{courseId: $courseId}){↵" +
              "            chapter{↵                chapterName↵                courseId↵                id↵                chapterLesson{↵                    chapterId↵                    id↵                    liveStatus↵                    name↵                    openTime↵                    lowQualityUrl↵                    normalQualityUrl↵                    highQualityUrl↵                    chatHistory↵                }↵            }↵        }↵    }↵    ",
      variables:{
        courseId:e.toString()
      }
    })
    let list = result.data.data.data.chapterListCached.chapter;
    let lessonId = 0;
    list.forEach(item=>{
      if(item.chapterLesson!==undefined&&item.chapterLesson.length>0){
        item.chapterLesson.forEach(i=>{
          if(i.liveStatus===1){
            lessonId = i.id;
          }
        })
      }
    })
    if(lessonId===0){
      message.info('该课程当前没有直播')
      return
    }
    let url = await Axios.post('https://api.xtjzx.cn/index',{
      operationName: "GetCourseVideo",
      query: "↵    query GetCourseVideo($courseId:Long,$lessonId:Long){↵        getCourseVideo(input:" +
              " {courseId:$courseId,lessonId: $lessonId}){↵            courseLive{↵                avChatRoomId↵                channelId↵                name↵                playUrl↵            }↵            courseVideo{↵                chatHistory↵                lowQualityUrl↵                normalQualityUrl↵                highQualityUrl↵            }↵        }↵    }",
      variables: {lessonId, courseId: e.toString()},
    })
    this.init(e,lessonId,url.data.data.data.getCourseVideo.courseLive.avChatRoomId)
  }
  render () {
    return (
            <div className={'chatBox'}>
              <div className={'chat'}>
                <div className={'none'}></div>
                <SingleMsg chatList={this.state.chatList}/>
                <div className={'info'}>
                  <span>热度：{this.state.hot}</span><span> 在线人数：{this.state.count}</span>
                  <Row><Col>课程选择：</Col><Select
                          showSearch
                          style={{ width: 300 }}
                          placeholder="选择一个课程"
                          optionFilterProp="children"
                          onChange={this.changeCourse}
                          filterOption={(input, option) =>
                                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                  >
                    {this.state.courseList.map(item=>{
                      return <Option value={item.Id} key={item.Id}>{item.name}</Option>
                    })}
                  </Select></Row>
                </div>
              </div>
            </div>)
  }
}

export default ChatViewer
