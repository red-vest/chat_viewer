import React from 'react'
import './livePlay.scss'
import DPlayer from 'dplayer'
let dp = undefined;
class LivePlay extends React.PureComponent{
  constructor (props) {
    super();
    this.play = this.play.bind(this)
  }

  play(url){
    dp = new DPlayer({
      container: document.getElementById(this.props.id),
      live: true,
      video:{
        url:url,
        type:'customFlv',
        customType:{
          customFlv: function (video, player) {
            const flvPlayer = window.flvjs.createPlayer({
              isLive:true,
              enableStashBuffer:false,
              cors:true,
              type: 'flv',
              url: video.src
            });
            flvPlayer.attachMediaElement(video);
            flvPlayer.load();
            flvPlayer.play();
          },
        }
      }
    })
  }

  render () {
    const {id,liveUrl} = this.props;
    if(liveUrl===undefined||''){
      try{dp.close()}catch (e) {}
    }else {
      this.play(liveUrl)
    }
    return(
            <div className={'dplayer'} id={id}/>
    )
  }
}

export default LivePlay
