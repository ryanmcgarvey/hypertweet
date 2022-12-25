"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var DHT = require('@hyperswarm/dht');
var Hyperswarm = require('hyperswarm');
var Corestore = require('corestore');
var Hyperbee = require('hyperbee');
var util_1 = require("../util");
var registryKeyPair = {
    publicKey: Buffer.from('e0d77896a66537bfbcd0d3755ae35bbc49ca49b0cd98927f0283009c1b2ecf0f', 'hex'),
    secretKey: Buffer.from('9a92fe1af9c31a1171e6ae8ad849c53c021cb5155437f699f5866beb9548564de0d77896a66537bfbcd0d3755ae35bbc49ca49b0cd98927f0283009c1b2ecf0f', 'hex')
};
console.log("main");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        function onconn(conn, peerinfo) {
            var _a, _b, _c;
            return __awaiter(this, void 0, void 0, function () {
                var publicKey, keystr, keyPair, profileCore, profile, profileName, existing;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            publicKey = conn.remotePublicKey;
                            keystr = publicKey.toString('hex');
                            keyPair = { publicKey: publicKey };
                            console.log("(registry / connection) ".concat(keystr.slice(0, 6)));
                            store.replicate(conn);
                            profileCore = store.get(publicKey, { keyPair: keyPair });
                            return [4 /*yield*/, profileCore.ready()];
                        case 1:
                            _d.sent();
                            profile = new Hyperbee(profileCore, { keyEncoding: 'utf-8', valueEncoding: 'json' });
                            return [4 /*yield*/, profile.ready()];
                        case 2:
                            _d.sent();
                            return [4 /*yield*/, profile.get('name')];
                        case 3:
                            profileName = (_a = (_d.sent())) === null || _a === void 0 ? void 0 : _a.value.toString();
                            if (!profileName) return [3 /*break*/, 5];
                            return [4 /*yield*/, registry.get(profileName)];
                        case 4:
                            existing = (_c = (_b = (_d.sent())) === null || _b === void 0 ? void 0 : _b.value) === null || _c === void 0 ? void 0 : _c.toString();
                            if (existing) {
                                console.log("(registry) Welcome BACK:", profileName);
                            }
                            else {
                                console.log("(registry) Welcome:", profileName);
                            }
                            registry.put(profileName, { publicKey: publicKey, keystr: keystr }, { cas: util_1.upsert });
                            _d.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
        var store, registryCore, registry, dht, swarm, discs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("main");
                    store = new Corestore('./.storage/registry');
                    console.log("Waiting for store init");
                    return [4 /*yield*/, store.ready()];
                case 1:
                    _a.sent();
                    registryCore = store.get({ keyPair: registryKeyPair, keyEncoding: 'utf-8', valueEncoding: 'json' });
                    console.log("Waiting for registry core init");
                    return [4 /*yield*/, registryCore.ready()];
                case 2:
                    _a.sent();
                    console.log("(registry/disc) ".concat(registryCore.discoveryKey.toString('hex')));
                    console.log("(registry/public) ".concat(registryCore.key.toString('hex')));
                    registry = new Hyperbee(registryCore, { keyEncoding: 'utf-8', valueEncoding: 'json' });
                    console.log("Waiting for registry core");
                    return [4 /*yield*/, registry.ready()];
                case 3:
                    _a.sent();
                    console.log("Waiting for DHT init");
                    dht = new DHT({ keyPair: registryKeyPair, bootstrap: false });
                    console.log("Waiting for swarm init");
                    swarm = new Hyperswarm({ dht: dht, keyPair: registryKeyPair });
                    swarm.on('connection', onconn);
                    discs = [
                        swarm.join(registryCore.key, { server: true, client: false }),
                    ];
                    return [4 /*yield*/, Promise.all(discs.map(function (disc) { return disc.flushed(); }))];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, swarm.flush()];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
