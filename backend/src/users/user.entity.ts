// Bu sınıf TypeORM entity'si değil; Prisma sonucunu tip güvenli şekilde
// uygulama içinde temsil etmek için sade bir model olarak kullanılır.
export class UserEntity {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
