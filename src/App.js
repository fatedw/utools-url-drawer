import React from 'react'
import './index.less'

import UrlDrawerManage from './UrlDrawerManage'
import UrlDrawerAdd from './UrlDrawerAdd'
import UrlDrawerList from './UrlDrawerList'

export default class App extends React.Component {
  state = {
    theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    enter: null
  }

  componentDidMount() {
    window.utools.onPluginEnter(enter => {
      this.setState({
        enter
      })
    })
    window.utools.onPluginOut(() => {
      this.setState({
        enter: null
      })
    })
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.setState({
        theme: e.matches ? 'dark' : 'light'
      })
    })
  }

  getEnterPage = (enter) => {
    switch (enter.code) {
      case 'UrlDrawerAdd':
        return <UrlDrawerAdd {
          ...enter
        }
        />
      case 'UrlDrawerManage':
        return <UrlDrawerManage {
          ...enter
        }
        />
      default:
        return <UrlDrawerList {
          ...enter
        }
        />
    }
  }

  render() {
    const {
      enter,
      theme
    } = this.state
    if (theme == 'dark') {
      require("antd/dist/antd.dark.css"); 
    } else{
      require("antd/dist/antd.css");
    }
    if (!enter) return false
    return ( 
      <div className='app-page'>{this.getEnterPage(enter)}</div>
    )
  }
}