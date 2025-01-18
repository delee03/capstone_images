import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    //  app.useGlobalGuards(); // Sử dụng guard toàn cục
    app.useGlobalPipes(
        new ValidationPipe({
            stopAtFirstError: true, // Stop at first error
            whitelist: true, // Remove non-whitelisted properties in request
            forbidNonWhitelisted: true, // Throw an error if unknown properties are present
            transform: true, // Automatically transform payloads to DTO instances
        }),
    ); // Sử dụng class ValidationPipe để kiểm tra dữ liệu gửi lên từ client
    const config = new DocumentBuilder()
        .setTitle('Images Project API')
        .setDescription('The Images Project API description')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
            'Bearer',
        ) // Thêm Bearer Token Authorization vào Swagger
        .build();
    app.setGlobalPrefix('api');

    const documentFactory = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
