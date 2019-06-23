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
        joinPartySettings: null,
        urlFocus: false,
        addTab: 'template',
        url: 'https://aframe.io/a-painter/',
      };
    }

    componentDidMount() {
      _postViewportMessage();
      window.addEventListener('resize', _postViewportMessage);
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

    openJoinPartySettings(joinPartySettings) {
      this.setState({
        item: null,
        joinPartySettings,
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

    onEngineRenderFocus() {
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

    blur() {
      this.setState({
        item: null,
        settings: null,
        joinPartySettings: null,
        urlFocus: false,
      }, () => {
        this.postMenuStatus();
      });
    }

    postMenuStatus() {
      window.postMessage({
        method: 'menu',
        open: this.state.item !== null || this.state.settings !== null || this.state.joinPartySettings !== null ||this.state.urlFocus,
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
              </div>
              <i class="fal fa-cube"/>
              {/* <div>World</div> */}
            </div>
            <div className={this.menuItemClassNames('settings')}onClick={() => this.openMenu('settings')}>
              <div className={this.menuItemPopupClassNames('settings')}>
                <div className="menu-item-popup-item" onClick={() => this.openSettings('settings')}>Settings...</div>
                <div className="menu-item-popup-item" onClick={() => this.openSettings('sdkPaths')}>SDK Paths...</div>
                <div className="menu-item-popup-item" onClick={() => this.openJoinPartySettings('joinPartySettings')}>Party...</div>
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
          <div className="engine-split">
            <div className="engine-left">
              <EngineRender onFocus={() => this.onEngineRenderFocus()}/>
              <Resizable
                minWidth="200px"
                minHeight={this.state.consoleOpen ? 150 : 0}
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
          <Settings settings={this.state.settings === 'settings'} open={!!this.state.settings} close={() => this.openSettings(null)}/>
          <JoinPartySettings settings={this.state.joinPartySettings === 'joinPartySettings'} open={!!this.state.joinPartySettings} close={() => this.openJoinPartySettings(null)}/>
        </div>
      );
    }
  }

class EngineRender extends React.Component {
  /* onMouseDown(e) {
    const engineRender = document.getElementById('engine-render');
    const bcr = engineRender.getBoundingClientRect();
    window.postMessage({
      method: 'viewportMouseDown',
      x: e.clientX - bcr.x,
      y: e.clientY - bcr.y,
      button: e.button,
    });
  }
  onMouseUp(e) {
    const engineRender = document.getElementById('engine-render');
    const bcr = engineRender.getBoundingClientRect();
    window.postMessage({
      method: 'viewportMouseUp',
      x: e.clientX - bcr.x,
      y: e.clientY - bcr.y,
      button: e.button,
    });
  }
  onClick(e) {
    const engineRender = document.getElementById('engine-render');
    const bcr = engineRender.getBoundingClientRect();
    window.postMessage({
      method: 'viewportClick',
      x: e.clientX - bcr.x,
      y: e.clientY - bcr.y,
      button: e.button,
    });
  }
  onMouseMove(e) {
    const engineRender = document.getElementById('engine-render');
    const bcr = engineRender.getBoundingClientRect();
    window.postMessage({
      method: 'viewportMouseMove',
      x: e.clientX - bcr.x,
      y: e.clientY - bcr.y,
    });
  }
  onMouseWheel(e) {
    const engineRender = document.getElementById('engine-render');
    const bcr = engineRender.getBoundingClientRect();
    window.postMessage({
      method: 'viewportMouseWheel',
      x: e.clientX - bcr.x,
      y: e.clientY - bcr.y,
      deltaX: e.deltaX,
      deltaY: e.deltaY,
    });
  } */

  render() {
    /*<div className="engine-render" id="engine-render" onClick={e => this.onClick(e)} onMouseDown={e => this.onMouseDown(e)} onMouseUp={e => this.onMouseUp(e)} onMouseMove={e => this.onMouseMove(e)} onMouseWheel={e => this.onMouseWheel(e)} />*/
    return (
      <div className="engine-render" id="engine-render" />
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

class JoinPartySettings extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
  }

  classNames() {
    const classNames = ['joinPartySettings'];
    if (this.props.open) {
      classNames.push('open');
    }
    return classNames.join(' ');
  }

  onMetricsBlur() {
  }

  joinParty() {
    const registryUrl = document.getElementById('registryUrl');
    const serverList = document.getElementById('serverList');

    window.postMessage({
      method: 'joinParty',
      registryUrl: registryUrl.value,
      name: serverList.value
    });
  }

  listPartyServers() {
    const registryUrl = document.getElementById('registryUrl');
    window.postMessage({
      method: 'listPartyServers',
      registryUrl: registryUrl.value
    });

    const serverList = document.getElementById('serverList');
    window.addEventListener('message',function(e) {
      serverList.focus();
      for (let i = 0; i < e.data.servers.length; i++) {
        const {name} = e.data.servers[i];

        var option = document.createElement("option");
        option.value = name;
        option.text = name;
        serverList.appendChild(option);
      }
    },false);
  }

  render() {
    return (
      <div className={this.classNames()}>
        <div className="settings-background" onClick={() => this.props.close()}></div>
        <div className="settings-foreground">
          <div className="title"><b>Party</b></div>
          <div>
            <label>Registry URL:</label>
            <br/>
            <input id="registryUrl" onChange={() => this.listPartyServers()} />
            <hr/>
            <label>Server List:</label>
            <br/>
            <select id="serverList" />
            <br/>
            <div className="button" id="button" onClick={() => this.joinParty()}>
              <div className="label"><b>Join Party</b></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}



export default Engine;
