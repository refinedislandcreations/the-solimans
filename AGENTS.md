# Image Optimization Agent

## Objective

Optimize all food images in the project by converting them to WebP format while significantly reducing file size and maintaining production-quality visual fidelity.

## Scope

Process all images located under:

```text
/assets/food
```

The directory structure may contain multiple levels of nested categories and subcategories. The agent must traverse the entire directory tree recursively and process images regardless of depth.

Example:

```text
/assets/food
├── asian
│   ├── Nasi Goreng.jpg
│   └── noodles
│       └── Beef Ramen.png
├── western
│   └── burgers
│       └── Cheese Burger.jpeg
└── desserts
    └── Chocolate Cake.jpg
```

## Requirements

### File Discovery

* Recursively scan all subdirectories within `/assets/food`.
* Process supported image formats:

  * `.jpg`
  * `.jpeg`
  * `.png`
  * `.bmp`
  * `.tiff`
  * `.webp` (skip unless re-optimization is explicitly requested)

### Conversion

* Convert all supported images to `.webp`.
* Use high-quality WebP compression.
* Prioritize maximum file size reduction without visible quality degradation.
* Preserve:

  * Dimensions
  * Aspect ratio
  * Orientation
  * Transparency (when applicable)

### Naming Convention

Convert filenames to kebab-case.

Examples:

```text
Food Name.jpg           → food-name.webp
Nasi Goreng Special.png → nasi-goreng-special.webp
Beef_Ramen.JPG          → beef-ramen.webp
```

Rules:

* Convert to lowercase.
* Replace spaces and underscores with hyphens.
* Remove special characters.
* Collapse repeated hyphens.
* Use `.webp` extension.

### Output Location

* Save the generated `.webp` file in the same directory as the source image.
* Preserve the existing folder hierarchy exactly.

Example:

```text
/assets/food/asian/noodles/Beef Ramen.png
↓
/assets/food/asian/noodles/beef-ramen.webp
```

### Existing Files

* Skip conversion when the correctly named `.webp` file already exists and is newer than the source file.
* Avoid duplicate outputs.

### Project References

After conversion, update all project references to the renamed assets:

* Static imports
* Dynamic imports
* Image paths
* Configuration files
* CMS mappings
* Content files

Replace references to:

```text
Food Name.jpg
Food Name.jpeg
Food Name.png
```

with:

```text
food-name.webp
```

### Cleanup

Only remove original files when:

```text
DELETE_ORIGINALS=true
```

Otherwise retain originals as a fallback.

## Validation

Verify that:

* Every source image has a corresponding `.webp` output.
* No broken image references remain in the codebase.
* Folder structure remains unchanged.
* Images render correctly after conversion.

## Reporting

Generate a final report containing:

* Total images discovered
* Total images converted
* Total images skipped
* Total conversion failures
* Original storage usage
* Optimized storage usage
* Total storage saved
* Percentage reduction

Include per-file statistics:

```text
Original Path
New Path
Original Size
New Size
Reduction %
```

## Success Criteria

* All food images are converted to WebP.
* File sizes are significantly reduced.
* Visual quality remains production-ready.
* Existing directory structure is preserved.
* All project references are updated automatically.
* No broken image assets remain.
