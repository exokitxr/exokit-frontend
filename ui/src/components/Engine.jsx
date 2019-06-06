import React from 'react';
import Resizable from 're-resizable';
import Dom from './Dom';
import Console from './Console';
import '../css/engine.css';

const _postViewportMessage = () => {
  const engineRender = document.getElementById('engine-render');
  const bcr = engineRender.getBoundingClientRect();
  const viewport = [bcr.x/window.innerWidth, bcr.y/window.innerHeight, bcr.width/window.innerWidth, bcr.height/window.innerHeight];
  window.postMessage({
    method: 'viewport',
    viewport,
  });
};

class Engine extends React.Component {
    constructor(props) {
      super(props);
      this.postMessage = this.postMessage.bind(this);
      this.setFlag = this.setFlag.bind(this);
      this.handleURLChange = this.handleURLChange.bind(this);
      this.state = {
        consoleOpen: false,
        flags: [],
        item: null,
        settings: null,
        joinServerSettings: null,
        urlFocus: false,
        addTab: 'template',
        url: 'https://aframe.io/a-painter/',
      };
    }

    componentDidMount() {
      _postViewportMessage();
      window.addEventListener('resize', _postViewportMessage);

      /* window.addEventListener('keydown', e => {
        console.log('iframe keydown ' + e.keyCode);
      });
      window.addEventListener('keyup', e => {
        console.log('iframe keyup ' + e.keyCode);
      });
      window.addEventListener('keypress', e => {
        console.log('iframe keypress ' + e.keyCode);
      }); */
    }

    postMessage(action){
      window.postMessage({
        action: action,
        flags: this.state.flags,
        url: this.state.url
      });
    }

    postViewportMessage(){
      _postViewportMessage();
    }

    handleURLChange(e){
      this.setState({
        url: e.target.value
      });
    }

    setFlag(e){
      let flag = e.target.value;
      if (!this.state.flags.includes(flag)) {
        this.state.flags.push(flag)
      } else {
        this.state.flags.splice(this.state.flags.indexOf(flag), 1);
      }
    }

    menuItemClassNames(item) {
      const classNames = ['menu-item'];
      if (item === this.state.item) {
        classNames.push('open');
      }
      return classNames.join(' ');
    }

    menuItemPopupClassNames(item) {
      const classNames = ['menu-item-popup'];
      if (item === this.state.item) {
        classNames.push('open');
      }
      return classNames.join(' ');
    }

    addTabClassNames(addTab) {
      const classNames = ['menu-item-popup-tab'];
      if (addTab === this.state.addTab) {
        classNames.push('selected');
      }
      return classNames.join(' ');
    }

    menuItemPopupItemsClassNames(addTab) {
      const classNames = ['menu-item-popup-items'];
      if (addTab === this.state.addTab) {
        classNames.push('open');
      }
      return classNames.join(' ');
    }

    urlPopupClassNames() {
      const classNames = ['url-popup'];
      if (this.state.urlFocus) {
        classNames.push('open');
      }
      return classNames.join(' ');
    }

    openMenu(item) {
      const open = this.state.item !== item;
      this.setState({item: open ? item : null}, () => {
        this.postMenuStatus();
      });
    }

    openSettings(settings) {
      this.setState({
        item: null,
        settings,
      }, () => {
        this.postMenuStatus();
      });
    }

    openJoinServerSettings(joinServerSettings) {
      this.setState({
        item: null,
        joinServerSettings,
      }, () => {
        this.postMenuStatus();
      });
    }

    openAddTab(e, addTab) {
      this.setState({
        addTab,
      });

      e.stopPropagation();
    }

    onEngineRenderClick() {
      this.blur();
    }

    focusUrlInput() {
      this.setState({
        item: null,
        urlFocus: true,
      }, () => {
        this.postMenuStatus();
      });
    }

    blurUrlInput() {
      this.setState({urlFocus: false}, () => {
        this.postMenuStatus();
      });
    }

    onUrlChange(e) {
      this.setState({
        url: e.target.value,
      });
    }

    open3dTab() {
      const urlInput = document.getElementById('url-input');
      const url = urlInput.value;

      window.postMessage({
        method: 'open',
        url,
        d: 3,
      });

      this.blur();
    }

    open2dTab() {
      const urlInput = document.getElementById('url-input');
      const url = urlInput.value;

      window.postMessage({
        method: 'open',
        url,
        d: 2,
      });

      this.blur();
    }

    addTemplate(template) {
      window.postMessage({
        method: 'add',
        template,
      });

      this.blur();
    }

    onFakeXrClick() {
      window.postMessage({
        method: 'click',
        target: 'fakeXr',
      });

      this.blur();
    }

    onXrClick() {
      window.postMessage({
        method: 'click',
        target: 'xr',
      });
    }

    toggleConsoleOpen(e) {
      this.setState({
        consoleOpen: !this.state.consoleOpen,
      });
    }

    joinServer() {
      window.postMessage({
        method: 'joinServer',
      });
    }

    blur() {
      this.setState({
        item: null,
        settings: null,
        joinServerSettings: null,
        urlFocus: false,
      }, () => {
        this.postMenuStatus();
      });
    }

    postMenuStatus() {
      window.postMessage({
        method: 'menu',
        open: this.state.item !== null || this.state.settings !== null || this.state.joinServerSettings !== null ||this.state.urlFocus,
      });
    }

    render() {
      return (
        <div id="Engine">
          <div className="row menu">
            <div className={this.menuItemClassNames('world')}onClick={() => this.openMenu('world')}>
              <div className={this.menuItemPopupClassNames('world')}>
                <div className="menu-item-popup-item">New</div>
                <div className="menu-item-popup-item">Exit</div>
                <div className="menu-item-popup-item" onClick={() => this.openJoinServerSettings('joinServerSettings')}>Join Server Settings...</div>
              </div>
              <i class="fal fa-cube"/>
              {/* <div>World</div> */}
            </div>
            <div className={this.menuItemClassNames('settings')}onClick={() => this.openMenu('settings')}>
              <div className={this.menuItemPopupClassNames('settings')}>
                <div className="menu-item-popup-item" onClick={() => this.openSettings('settings')}>Settings...</div>
                <div className="menu-item-popup-item" onClick={() => this.openSettings('sdkPaths')}>SDK Paths...</div>
              </div>
              <i class="fal fa-cogs"/>
              {/* <div>Settings</div> */}
            </div>
            <div className="url">
              <div className={this.urlPopupClassNames()}>
                <div className="url-item" onMouseDown={e => e.preventDefault()} onClick={() => this.open3dTab()}>3D Reality Tab</div>
                <div className="url-item" onMouseDown={e => e.preventDefault()} onClick={() => this.open2dTab()}>2D Reality Tab</div>
              </div>
              <input type="text" className="url-input" id="url-input" value={this.state.url} onChange={e => this.onUrlChange(e)} onFocus={() => this.focusUrlInput()} onBlur={() => this.blurUrlInput()}/>
            </div>
            <div className={this.menuItemClassNames('add')}onClick={() => this.openMenu('add')}>
              <div className={this.menuItemPopupClassNames('add')}>
                <div className="menu-item-popup-tabs">
                  <div className={this.addTabClassNames('template')} onClick={e => this.openAddTab(e, 'template')}>Template</div>
                  <div className={this.addTabClassNames('examples')} onClick={e => this.openAddTab(e, 'examples')}>Examples</div>
                </div>
                <div className={this.menuItemPopupItemsClassNames('template')}>
                  <div className="menu-item-popup-item" onClick={() => this.addTemplate('blank')}>
                    <i className="fal fa-file"></i>
                    <div className="label">Blank layer</div>
                  </div>
                  <div className="menu-item-popup-item" onClick={() => this.addTemplate('aframe')}>
                    <i className="fab fa-autoprefixer"/>
                    <div className="label">A-Frame layer</div>
                  </div>
                  <div className="menu-item-popup-item" onClick={() => this.addTemplate('babylon')}>
                    <i className="fab fa-btc"/>
                    <div className="label">Babylon.js layer</div>
                  </div>
                </div>
                <div className={this.menuItemPopupItemsClassNames('examples')}>
                  <div className="menu-item-popup-item" onClick={() => this.addTemplate('webXrSample')}>
                    <i class="fas fa-globe-europe"/>
                    <div className="label">WebXR Sample</div>
                  </div>
                  <div className="menu-item-popup-item" onClick={() => this.addTemplate('kitchenSink')}>
                    <i class="far fa-meteor"/>
                    <div className="label">Kitchen sink</div>
                  </div>
                  <div className="menu-item-popup-item" onClick={() => this.addTemplate('exobot')}>
                    <i class="fal fa-robot"/>
                    <div className="label">Exobot</div>
                  </div>
                  <div className="menu-item-popup-item" onClick={() => this.addTemplate('meshing')}>
                    <i class="fal fa-th"/>
                    <div className="label">Meshing</div>
                  </div>
                  <div className="menu-item-popup-item" onClick={() => this.addTemplate('planes')}>
                    <i class="fal fa-solar-panel"/>
                    <div className="label">Planes</div>
                  </div>
                  <div className="menu-item-popup-item" onClick={() => this.addTemplate('paint')}>
                    <i class="fal fa-paint-brush"/>
                    <div className="label">Paint</div>
                  </div>
                  <div className="menu-item-popup-item" onClick={() => this.addTemplate('hitTest')}>
                    <i class="fal fa-crosshairs"/>
                    <div className="label">Hit test</div>
                  </div>
                  <div className="menu-item-popup-item" onClick={() => this.addTemplate('hands')}>
                    <i class="fal fa-hand-paper"/>
                    <div className="label">Hand tracking</div>
                  </div>
                  <div className="menu-item-popup-item" onClick={() => this.addTemplate('eyeTracking')}>
                    <i class="fal fa-eye"/>
                    <div className="label">Eye tracking</div>
                  </div>
                </div>
              </div>
              <i class="fal fa-plus-hexagon"/>
            </div>
            <div className="buttons">
              <div className="button" onClick={e => this.toggleConsoleOpen(e)}>
                <i class="fas fa-terminal"/>
                <div className="label">Console</div>
              </div>
              <div className="button" onClick={() => this.onXrClick()}>
                <i class="fas fa-head-vr"/>
                <div className="label">Enter XR</div>
              </div>
              <div className="button" onClick={() => this.onFakeXrClick()}>
                <i class="fal fa-vr-cardboard"/>
                <div className="label">Fake XR</div>
              </div>
            </div>
          </div>
          <Settings settings={this.state.settings === 'settings'} open={!!this.state.settings} close={() => this.openSettings(null)}/>
          <JoinServerSettings settings={this.state.joinServerSettings === 'joinServerSettings'} open={!!this.state.joinServerSettings} close={() => this.openJoinServerSettings(null)}/>
          <div className="engine-split">
            <div className="engine-left">
              <div className="engine-render" id="engine-render" onClick={() => this.onEngineRenderClick()} />
              <Resizable
                minWidth="200px"
                // minHeight="100px"
                // maxHeight="300px"
                onResize={(e, direction, ref, d) => {
                  _postViewportMessage();
                }}>
                <Console open={this.state.consoleOpen} postViewportMessage={this.postViewportMessage} />
              </Resizable>
            </div>
            <Resizable
              minWidth="200px"
              maxWidth="300px"
              onResize={(e, direction, ref, d) => {
                _postViewportMessage();
              }}>
            <div className="engine-right">
              <Dom/>
            </div>
            </Resizable>
          </div>
        </div>
      );
    }
  }

class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 1920/2 + '',
      height: 1080 + '',
      xr: 'all',
    };
  }

  classNames() {
    const classNames = ['settings'];
    if (this.props.open) {
      classNames.push('open');
    }
    return classNames.join(' ');
  }

  onWidthChange(e) {
    this.setState({
      width: e.target.value,
    });
  }
  onHeightChange(e) {
    this.setState({
      height: e.target.value,
    });
  }

  onMetricsBlur() {
    let width = parseInt(this.state.width, 10);
    let height = parseInt(this.state.height, 10);

    if (this.state.width !== (width + '')) {
      width = 1920/2;

      this.setState({
        width: width + '',
      });
    }
    if (this.state.height !== (height + '')) {
      height = 1080;

      this.setState({
        height: height + '',
      });
    }

    window.postMessage({
      method: 'fakeVrMetrics',
      width,
      height,
    });
  }

  onXrChange(value) {
    this.setState({
      xr: value,
    });

    window.postMessage({
      method: 'setting',
      key: 'xr',
      value,
    });
  }

  render() {
    return (
      <div className={this.classNames()}>
        <div className="settings-background" onClick={() => this.props.close()}></div>
        <div className="settings-foreground">
          <div className="title">Settings</div>
          <div>
            <label>Width <input type="text" value={this.state.width} onChange={e => this.onWidthChange(e)} onBlur={() => this.onMetricsBlur()} /></label>
            <label>Height <input type="text" value={this.state.height} onChange={e => this.onHeightChange(e)} onBlur={() => this.onMetricsBlur()} /></label>
          </div>
          <div>
            <label><input type="radio" name="xr" value="all" checked={this.state.xr === 'all'} onChange={e => e.target.value ? this.onXrChange('all') : null} /><span>All</span></label>
            <label><input type="radio" name="xr" value="webxr" checked={this.state.xr === 'webxr'} onChange={e => e.target.value ? this.onXrChange('webxr') : null} /><span>WebXR</span></label>
            <label><input type="radio" name="xr" value="webvr" checked={this.state.xr === 'webvr'} onChange={e => e.target.value ? this.onXrChange('webvr') : null} /><span>WebVR</span></label>
          </div>
        </div>
      </div>
    );
  }
}

class JoinServerSettings extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
  }

  classNames() {
    const classNames = ['joinServerSettings'];
    if (this.props.open) {
      classNames.push('open');
    }
    return classNames.join(' ');
  }

  onMetricsBlur() {
  }

  async createOffer() {
    const button = document.getElementById('button');
    const offer = document.getElementById('offer');
    const answer = document.getElementById('answer');

    window.addEventListener('message',function(e) {
      offer.value = e.data.sdp;
    },false);

    window.postMessage({
      method: 'createOffer',
    });

    button.disabled = true;
  }

  async createAnswer(sdp) {
    const button = document.getElementById('button');
    const offer = document.getElementById('offer');
    const answer = document.getElementById('answer');

    window.addEventListener('message',function(e) {
      answer.focus();
      answer.value = e.data.sdp;
      answer.select();
    },false);

    window.postMessage({
      method: 'createOffer',
      sdp: offer.value
    });

    button.disabled = offer.disabled = true;
  };

  submitAnswer(e) {
    const answer = document.getElementById('answer');

    window.postMessage({
      method: 'submitAnswer',
      sdp: answer.value
    });

    answer.disabled = true;
  };

  joinServer() {
    // console.log("joinServer ---- datachannel = " + this.state.dcState);
    // window.postMessage({
    //   method: 'joinServer',
    //   datachannel: this.state.dcState,
    // });
  }

  render() {
    return (
      <div className={this.classNames()}>
        <div className="settings-background" onClick={() => this.props.close()}></div>
        <div className="settings-foreground">
          <div className="title">--- webrtc ---</div>
          <div>
            <label>Offer <textarea id="offer" placeholder="Paste offer here" onBlur={() => this.onMetricsBlur()} /></label>
            <label>Answer <textarea id="answer" onBlur={() => this.onMetricsBlur()} /></label>
            <div className="button" id="button" onClick={() => this.createOffer()}>
              <div className="label">Create Offer</div>
            </div>
            <div className="button" id="button" onClick={() => this.createAnswer()}>
              <div className="label">Create Answer</div>
            </div>
            <div className="button" id="button" onClick={() => this.submitAnswer()}>
              <div className="label">Submit Answer</div>
            </div>
            <div className="button" id="button" onClick={() => this.joinServer()}>
              <div className="label">joinServer</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Engine;
