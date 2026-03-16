#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import argparse
import fnmatch
import sys
from pathlib import Path

def parse_key_value_args():
    """Парсит аргументы в формате key=value"""
    args_dict = {
        'images_path': None,
        'search_path': None,
        'img_extensions': ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp', '.ico'],
        'search_extensions': ['.html', '.htm', '.css', '.js', '.php', '.py', '.xml', '.json'],
        'delete': False,
        'verbose': False
    }
    
    for arg in sys.argv[1:]:
        if '=' in arg:
            key, value = arg.split('=', 1)
            key = key.lower()
            
            if key == 'images_path' or key == 'search_path':
                args_dict[key] = value
            elif key == 'img_extensions' or key == 'search_extensions':
                # Разделяем по пробелам или запятым
                extensions = value.replace(',', ' ').split()
                args_dict[key] = [ext if ext.startswith('.') else f'.{ext}' for ext in extensions]
            elif key == 'delete':
                args_dict[key] = value.lower() in ['true', 'yes', '1', 'y']
            elif key == 'verbose':
                args_dict[key] = value.lower() in ['true', 'yes', '1', 'y']
        else:
            # Если аргумент без =, проверяем флаги
            if arg in ['-d', '--delete']:
                args_dict['delete'] = True
            elif arg in ['-v', '--verbose']:
                args_dict['verbose'] = True
    
    return args_dict

def get_all_files(directory, extensions):
    """
    Рекурсивно собирает все файлы с указанными расширениями в директории.
    """
    files = []
    
    if not directory:
        print("Ошибка: Не указан путь к директории")
        return files
    
    directory = Path(directory)
    
    if not directory.exists():
        print(f"Ошибка: Директория {directory} не существует")
        return files
    
    print(f"Поиск в директории: {directory.absolute()}")
    
    for ext in extensions:
        pattern = f"**/*{ext}"
        found_files = list(directory.glob(pattern))
        files.extend(found_files)
        print(f"  Найдено {len(found_files)} файлов с расширением {ext}")
    
    return files

def search_references(directory, extensions, target_files):
    """
    Ищет упоминания целевых файлов во всех файлах с указанными расширениями.
    """
    references = {file: [] for file in target_files}
    
    if not directory:
        print("Ошибка: Не указан путь для поиска")
        return references
    
    directory = Path(directory)
    
    if not directory.exists():
        print(f"Ошибка: Директория {directory} не существует")
        return references
    
    # Получаем все файлы для поиска
    search_files = []
    for ext in extensions:
        pattern = f"**/*{ext}"
        search_files.extend(list(directory.glob(pattern)))
    
    print(f"\nПоиск упоминаний в {len(search_files)} файлах...")
    
    # Создаем множество имен файлов для быстрого поиска
    img_names = {file.name: file for file in target_files}
    img_stems = {file.stem: file for file in target_files}
    
    for search_file in search_files:
        try:
            with open(search_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
                # Проверяем каждое имя файла
                for name, img_file in img_names.items():
                    if name in content:
                        references[img_file].append(search_file)
                
                # Проверяем имена без расширения
                for stem, img_file in img_stems.items():
                    if stem in content and references[img_file].count(search_file) == 0:
                        references[img_file].append(search_file)
                        
        except Exception as e:
            print(f"  Ошибка при чтении {search_file}: {e}")
    
    return references

def main():
    # Пробуем сначала распарсить как key=value аргументы
    args = parse_key_value_args()
    
    # Если не нашли paths в формате key=value, используем стандартный argparse
    if not args['images_path'] or not args['search_path']:
        parser = argparse.ArgumentParser(
            description='Поиск неиспользуемых файлов изображений в проекте'
        )
        
        parser.add_argument(
            'images_path',
            help='Путь к директории с изображениями для анализа'
        )
        
        parser.add_argument(
            'search_path',
            help='Путь к директории с исходным кодом для поиска упоминаний'
        )
        
        parser.add_argument(
            '-i', '--img-extensions',
            nargs='+',
            default=['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp', '.ico'],
            help='Расширения файлов изображений'
        )
        
        parser.add_argument(
            '-s', '--search-extensions',
            nargs='+',
            default=['.html', '.htm', '.css', '.js', '.php', '.py', '.xml', '.json'],
            help='Расширения файлов для поиска упоминаний'
        )
        
        parser.add_argument(
            '-d', '--delete',
            action='store_true',
            help='Удалить неиспользуемые файлы'
        )
        
        parser.add_argument(
            '-v', '--verbose',
            action='store_true',
            help='Подробный вывод'
        )
        
        cmd_args = parser.parse_args()
        args['images_path'] = cmd_args.images_path
        args['search_path'] = cmd_args.search_path
        args['img_extensions'] = cmd_args.img_extensions
        args['search_extensions'] = cmd_args.search_extensions
        args['delete'] = cmd_args.delete
        args['verbose'] = cmd_args.verbose
    
    print("=" * 60)
    print("Поиск неиспользуемых изображений")
    print("=" * 60)
    
    # Шаг 1: Собираем все изображения
    print(f"\n[1/3] Сканирование изображений в {args['images_path']}")
    image_files = get_all_files(args['images_path'], args['img_extensions'])
    print(f"Всего найдено изображений: {len(image_files)}")
    
    if not image_files:
        print("Изображения не найдены. Завершение работы.")
        return
    
    # Шаг 2: Ищем упоминания
    print(f"\n[2/3] Поиск упоминаний в {args['search_path']}")
    references = search_references(args['search_path'], args['search_extensions'], image_files)
    
    # Шаг 3: Анализируем результаты
    print("\n[3/3] Анализ результатов")
    
    used_images = []
    unused_images = []
    
    for img_file, refs in references.items():
        if refs:
            used_images.append((img_file, refs))
        else:
            unused_images.append(img_file)
    
    # Вывод статистики
    print(f"\n{'=' * 60}")
    print(f"СТАТИСТИКА:")
    print(f"  Всего изображений: {len(image_files)}")
    print(f"  Используется: {len(used_images)}")
    print(f"  НЕ ИСПОЛЬЗУЕТСЯ: {len(unused_images)}")
    print(f"{'=' * 60}")
    
    # Вывод используемых изображений (если verbose)
    if args['verbose'] and used_images:
        print(f"\n📌 ИСПОЛЬЗУЕМЫЕ ИЗОБРАЖЕНИЯ ({len(used_images)}):")
        for img_file, refs in used_images:
            print(f"  ✅ {img_file}")
            for ref in refs[:3]:
                print(f"      └ используется в: {ref}")
            if len(refs) > 3:
                print(f"      └ и ещё в {len(refs) - 3} файлах")
    
    # Вывод неиспользуемых изображений
    if unused_images:
        print(f"\n⚠️  НЕИСПОЛЬЗУЕМЫЕ ИЗОБРАЖЕНИЯ ({len(unused_images)}):")
        for img_file in unused_images:
            print(f"  ❌ {img_file}")
        
        # Удаление по запросу
        if args['delete']:
            print(f"\n🗑️  Удаление неиспользуемых изображений...")
            confirm = input(f"Вы уверены, что хотите удалить {len(unused_images)} файлов? (y/N): ")
            
            if confirm.lower() in ['y', 'yes', 'да']:
                deleted = 0
                errors = 0
                for img_file in unused_images:
                    try:
                        os.remove(img_file)
                        print(f"  Удален: {img_file}")
                        deleted += 1
                    except Exception as e:
                        print(f"  Ошибка при удалении {img_file}: {e}")
                        errors += 1
                
                print(f"\n✅ Удалено файлов: {deleted}")
                if errors:
                    print(f"❌ Ошибок при удалении: {errors}")
            else:
                print("Удаление отменено")
    else:
        print(f"\n✨ Поздравляем! Все изображения используются!")
    
    print(f"\n{'=' * 60}")
    print("Работа завершена")

if __name__ == "__main__":
    main()