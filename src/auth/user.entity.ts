import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique, OneToMany } from "typeorm";
import { Wishlist } from "../wishlist/wishlist.entity";

@Entity()
@Unique(['userid'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userid: string;

    @Column()
    username: string;

    @Column()
    password: string;
    
    // code 값이 회원가입시 null, 후에 발급되므로
    // nullable하지만, code 컬럼은 비어지면 안되므로 code?: string 로 처리 x
    @Column({ nullable: true })
    code: string;
    
    @Column()
    type: string;

    @OneToMany(type => Wishlist, wishlist => wishlist.user, { eager: true })
    wishlist: Wishlist[];
}