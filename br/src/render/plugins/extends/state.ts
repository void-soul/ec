export interface Config {
  GlobalArray: {
    [key: string]: string[];
  };
  GlobalMap: {
    [key: string]: {
      [key: string]: string;
    };
  };
}

export default class {
  // _user?: User;
  // _resources?: Resource[];
  // _config?: Config;
  // _dataPermission?: string[];
  // get dataPermission(): string[] | undefined {
  //   if (!this._dataPermission) {
  //     this._dataPermission = win.cached('dataPermission').dataPermission;
  //   }
  //   return this._dataPermission;
  // }
  // set dataPermission(dataPermission: string[] | undefined) {
  //   this._dataPermission = dataPermission;
  //   win.cache({
  //     dataPermission
  //   });
  // }
  // get config(): Config | undefined {
  //   if (!this._config) {
  //     this._config = win.cached('config').config;
  //   }
  //   return this._config;
  // }
  // set config(config: Config | undefined) {
  //   this._config = config;
  //   win.cache({config});
  // }
  // get resources(): Resource[] | undefined {
  //   if (!this._resources) {
  //     this._resources = win.cached('resources').resources;
  //   }
  //   return this._resources;
  // }
  // set resources(resources: Resource[] | undefined) {
  //   this._resources = resources;
  //   win.cache({
  //     resources
  //   });
  // }
  // get user(): User | undefined {
  //   if (!this._user) {
  //     this._user = win.cached('user').user;
  //   }
  //   return this._user;
  // }
  // set user(user: User | undefined) {
  //   this._user = user;
  //   if (user) {
  //     win.cache({
  //       user
  //     });
  //     win.cache({devid: user.devid});
  //   }
  // }
  // get devid() {
  //   if (!this._user) {
  //     this._user = win.cached('user').user;
  //   }
  //   if (this._user) {
  //     return this._user.devid;
  //   }
  //   return undefined;
  // }
  // get firstName() {
  //   if (!this._user) {
  //     this._user = win.cached('user').user;
  //   }
  //   if (this._user) {
  //     return this._user.realname.substr(0, 1);
  //   }
  //   return undefined;
  // }
}
