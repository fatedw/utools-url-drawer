import React from 'react';

export default class UrlDrawerList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      resultList: [],
      selectedIndex: 0
    }
    this.itemHeight = 48, this.itemMaxNum = 10;
    this.isMacOs = window.utools.isMacOs();
    this.quickIndexIdentity = []
    const hotKey = this.isMacOs ? "⌘+" : "Alt+";
    for (let t = 1; t <= this.itemMaxNum; t++) {
      this.quickIndexIdentity.push(React.createElement("div", {
        key: "quick-index-" + t
      }, hotKey + (this.itemMaxNum === t ? 0 : t)));
    }
    this.codeData = window.services.queryCodeData(this.props.code) || { 'urls': [] };
  }

  componentDidMount() {
    window.utools.setSubInput(this.search, "搜索关键字")
    this.setState({ resultList: this.codeData['urls'].sort((x, y) => y['pri'] - x['pri']).slice(0, this.itemMaxNum) });
    window.utools.onPluginDetach(() => {
      window.utools.setExpendHeight(this.state.resultList.length * this.itemHeight);
    })
    window.addEventListener("keydown", this.onKeydownAction);
    this.searchResultRef.addEventListener("wheel", this.onWheel, {
      passive: !1
    })
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.onKeydownAction)
  }

  search = ({ text }) => {
    this.setState({ resultList: this.codeData['urls'].filter(it => it['urlKey'].search(text) >= 0).sort((x, y) => y['pri'] - x['pri']).slice(0, this.itemMaxNum) })
    this.setState({ selectedIndex: 0 })
  }

  selectItem = () => {
    const { resultList, selectedIndex } = this.state;
    const result = resultList[selectedIndex]
    window.utools.shellOpenExternal(result['url'])
    const selectUrl = this.codeData['urls'].filter(url=>url['urlKey'] === result['urlKey'])[0];
    const maxPri = Math.max(...this.codeData['urls'].map(url => url['pri']))
    if (selectUrl['pri'] <= maxPri) {
      selectUrl['pri']++;
    }
    window.services.saveCodeData(this.codeData);
    window.utools.outPlugin();
    window.utools.hideMainWindow();
  }

  onKeydownAction = e => {
    const { resultList, selectedIndex } = this.state;
    if (0 === resultList.length) return;
    if (!["ArrowUp", "ArrowDown", "Enter", "NumpadEnter"].includes(e.code)) {
      if (!(this.isMacOs ? e.metaKey : e.altKey)) return;
      if (e.code.startsWith("Digit")) {
        let num = parseInt(e.key);
        if (num === 0) {
          if (resultList.length >= this.itemMaxNum) {
            this.setState({ selectedIndex: this.itemMaxNum })
            this.selectItem()
          }
          return;
        }
        if (num <= resultList.length) {
          this.setState({ selectedIndex: num - 1 })
          this.selectItem()
          return;
        }
      }
      return
    }
    e.preventDefault();
    if ("Enter" === e.code || "NumpadEnter" === e.code) {
      this.selectItem();
      return;
    }
    else if ("ArrowDown" === e.code && selectedIndex < resultList.length - 1) {
      this.setState({ selectedIndex: selectedIndex + 1 });
    }
    else if ("ArrowUp" === e.code && selectedIndex > 0) {
      this.setState({ selectedIndex: selectedIndex - 1 });
    }

  }

  handleMouseClick = (e) => {
    const index = Math.round(this.searchResultRef.scrollTop / this.itemHeight) + (e.clientY / this.itemHeight | 0);
    this.setState({ selectedIndex: index });
    this.selectItem();
  }

  handleMouseEnter = e => {
    this.enableMoveSelect = !1, setTimeout((() => {
      this.enableMoveSelect = !0
    }), 50)
  }

  handleMouseMove = e => {
    if (!this.enableMoveSelect) return;
    const index = Math.round(this.searchResultRef.scrollTop / this.itemHeight) + (e.clientY / this.itemHeight | 0);
    if (index !== this.state.selectedIndex) {
      this.setState({
        selectedIndex: index
      })
    }
  }

  handleMouseDown = e => {
    1 === e.button && (e.stopPropagation(), e.preventDefault())
  }

  render() {
    const {
      resultList,
      selectedIndex
    } = this.state;
    window.utools.setExpendHeight(resultList.length * this.itemHeight);
    return (
      <div className='list' ref={e => this.searchResultRef = e} onMouseEnter={this.handleMouseEnter} onMouseMove={this.handleMouseMove} onMouseDown={this.handleMouseDown} onClick={this.handleMouseClick}>
        <div style={{ width: "100%", height: resultList.length * this.itemHeight }}>
          {
            resultList.map((item, index) => {
              return (
                <div key={item['urlKey'] + index} className={"list-item" + (index === selectedIndex ? " list-item-selected" : "")}>
                  <div className="list-item-icon">
                    <svg viewBox="0 0 1024 1024"><path d="M984.6 472.6c-21.8 0-39.4 17.6-39.4 39.4 0 238.9-194.3 433.2-433.2 433.2S78.8 750.9 78.8 512 273.1 78.8 512 78.8c21.8 0 39.4-17.6 39.4-39.4S533.8 0 512 0C229.7 0 0 229.7 0 512s229.7 512 512 512 512-229.7 512-512c0-21.8-17.6-39.4-39.4-39.4z" p-id="8048"></path><path d="M500.7 293.8c-74.5 131.1-47.8 269.6-32.8 323.1 4.9 17.4 20.7 28.8 37.9 28.8 3.5 0 7.1-0.5 10.7-1.5 21-5.8 33.2-27.6 27.3-48.5-12.3-44-34.5-157.5 25.4-262.9 59.3-104.3 181.6-167.6 315.2-169.7l-37.9 31.8c-16.7 14-18.8 38.8-4.9 55.5 7.8 9.3 19 14.1 30.2 14.1 8.9 0 17.9-3 25.3-9.2l103.6-86.9c9.1-4.1 16.8-11.3 20.6-21.2 7-17.7 0.3-37.8-15.8-47.9-18.7-11.7-37.6-26.2-57.6-41.6-20.7-15.9-42-32.4-64.1-46.1C865.4 0.1 841 5.8 829.5 24.2s-5.8 42.8 12.6 54.2c3.4 2.1 6.8 4.3 10.2 6.6-149.6 10.6-282 86.3-351.6 208.8z"></path></svg>
                  </div>
                  <div className="list-item-content">
                    <div className="list-item-title">{item['urlKey']}</div>
                    <div className="list-item-description">{item['desc']}</div>
                  </div>
                </div>
              )
            })
          }
        </div>
        <div className='quick-index-identity' >
          {this.quickIndexIdentity}
        </div>
        <div></div>
      </div>
    )
  }
}