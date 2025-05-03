"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const mongoose_1 = require("@nestjs/mongoose");
const user_schema_1 = require("../user/user.schema");
const user_service_1 = require("../user/user.service");
const jwt_1 = require("@nestjs/jwt");
const mailer_service_1 = require("../helper/mailer.service");
const user_module_1 = require("../user/user.module");
const wallet_schema_1 = require("../wallet/wallet.schema");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: "User", schema: user_schema_1.userSchema }]), jwt_1.JwtModule.register({
                secret: "secretformecoceventmanagementsystem"
            }),
            mongoose_1.MongooseModule.forFeature([{ name: 'Wallet', schema: wallet_schema_1.walletSchema }]),
            user_module_1.UserModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, user_service_1.UserService, mailer_service_1.MailerService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map