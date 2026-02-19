import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { UserSortOption } from '../dto/list-users-query.dto';

function ApiUserIdParam(description: string) {
  return ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description,
  });
}

export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Yeni kullanıcı oluştur' }),
    ApiResponse({
      status: 201,
      description: 'Kullanıcı başarıyla oluşturuldu.',
    }),
    ApiResponse({
      status: 409,
      description: 'E-posta zaten kullanımda olduğu için kayıt açılamadı.',
    }),
  );
}

export function ApiFindAllUsers() {
  return applyDecorators(
    ApiOperation({ summary: 'Tüm kullanıcıları listele' }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Sayfa numarası (varsayılan: 1).',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 20,
      description: 'Sayfa başına kayıt sayısı (varsayılan: 20, maksimum: 100).',
    }),
    ApiQuery({
      name: 'q',
      required: false,
      type: String,
      example: 'yunus',
      description: 'Ad veya e-posta üzerinde metin araması.',
    }),
    ApiQuery({
      name: 'sort',
      required: false,
      enum: UserSortOption,
      example: UserSortOption.CreatedAtDesc,
      description: 'Sıralama biçimi.',
    }),
    ApiResponse({ status: 200, description: 'Kullanıcı listesi döndürüldü.' }),
  );
}

export function ApiFindOneUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Tek kullanıcı getir' }),
    ApiUserIdParam('Detayı istenen kullanıcının ID değeri.'),
    ApiResponse({ status: 200, description: 'Kullanıcı bulundu.' }),
    ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı.' }),
  );
}

export function ApiUpdateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Kullanıcıyı güncelle' }),
    ApiUserIdParam('Güncellenecek kullanıcının ID değeri.'),
    ApiResponse({
      status: 200,
      description: 'Kullanıcı başarıyla güncellendi.',
    }),
    ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı.' }),
    ApiResponse({
      status: 409,
      description:
        'E-posta zaten kullanımda olduğu için güncelleme yapılamadı.',
    }),
  );
}

export function ApiRemoveUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Kullanıcıyı sil' }),
    ApiUserIdParam('Silinecek kullanıcının ID değeri.'),
    ApiResponse({ status: 200, description: 'Kullanıcı başarıyla silindi.' }),
    ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı.' }),
  );
}
