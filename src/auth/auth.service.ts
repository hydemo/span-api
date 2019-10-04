import { Inject } from '@nestjs/common';
// import { UserService } from '../api/users/user.service';
import { AdminService } from 'src/module/admin/admin.service';
import { CompanyService } from 'src/module/company/company.service';
import { UserService } from 'src/module/user/user.service';

export class AuthService {
    constructor(
        @Inject(UserService) private readonly userService: UserService,
        @Inject(AdminService) private readonly adminService: AdminService,
        @Inject(CompanyService) private readonly companyService: CompanyService,
    ) { }

    async validateUser(payload: { type: string, id: string }): Promise<any> {
        if (payload.type === 'user') {
            return await this.userService.findById(payload.id);
        } else if (payload.type === 'company') {
            return await this.companyService.findById(payload.id);
        } else if (payload.type === 'admin') {
            return await this.adminService.findById(payload.id);
        }
    }
}