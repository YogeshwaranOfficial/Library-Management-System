import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "./categories.repository.js",
  () => ({
    default: {
      getCategoriesWithMetrics: jest.fn(),
      findByName: jest.fn(),
      findById: jest.fn(),
      createCategory: jest.fn(),
      updateCategoryName: jest.fn(),
      deleteCategory: jest.fn(),
    },
  })
);

const { default: categoriesService } =
  await import("./categories.service.js");

const { default: categoryRepository } =
  await import("./categories.repository.js");

const mockCategoryRepository =
  categoryRepository as any;

describe(
  "Categories Service Unit Tests",
  () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe(
      "getAllCategoriesWithMetrics",
      () => {
        it(
          "should return paginated metrics when count is number",
          async () => {
            mockCategoryRepository.getCategoriesWithMetrics.mockResolvedValue(
              {
                rows: [
                  {
                    category_id: "cat-1",
                    category_name:
                      "Programming",
                    booksCount: 10,
                    lendingCount: 25,
                  },
                ],
                count: 5,
              }
            );

            const result =
              await categoriesService.getAllCategoriesWithMetrics(
                1,
                10
              );

            expect(
              result
            ).toEqual({
              rows: [
                {
                  category_id:
                    "cat-1",
                  category_name:
                    "Programming",
                  booksCount: 10,
                  lendingCount: 25,
                  totalCopies: 0,
                },
              ],
              totalCount: 5,
              totalPages: 1,
              currentPage: 1,
            });
          }
        );

        it(
          "should return paginated metrics when count is grouped array",
          async () => {
            mockCategoryRepository.getCategoriesWithMetrics.mockResolvedValue(
              {
                rows: [],
                count: [
                  {},
                  {},
                  {},
                ],
              }
            );

            const result =
              await categoriesService.getAllCategoriesWithMetrics(
                1,
                10
              );

            expect(
              result.totalCount
            ).toBe(3);

            expect(
              result.totalPages
            ).toBe(1);
          }
        );

        it("should sanitize aggregate string values", async () => {
  mockCategoryRepository.getCategoriesWithMetrics.mockResolvedValue({
    rows: [
      {
        category_id: "cat-1",
        booksCount: "12",
        totalCopies: "50",
        lendingCount: "9",
      },
    ],
    count: 1,
  });

  const result =
    await categoriesService.getAllCategoriesWithMetrics(
      1,
      10
    );

  expect(result.rows[0]).toMatchObject({
    booksCount: 12,
    totalCopies: 50,
    lendingCount: 9,
  });
});

it("should default aggregate values to zero", async () => {
  mockCategoryRepository.getCategoriesWithMetrics.mockResolvedValue({
    rows: [
      {
        category_id: "cat-1",
        booksCount: null,
        totalCopies: null,
        lendingCount: null,
      },
    ],
    count: 1,
  });

  const result =
    await categoriesService.getAllCategoriesWithMetrics(
      1,
      10
    );

  expect(result.rows[0]).toMatchObject({
    booksCount: 0,
    totalCopies: 0,
    lendingCount: 0,
  });
});

        it(
          "should pass filters correctly",
          async () => {
            mockCategoryRepository.getCategoriesWithMetrics.mockResolvedValue(
              {
                rows: [],
                count: 0,
              }
            );

            await categoriesService.getAllCategoriesWithMetrics(
              2,
              20,
              "prog",
              "HIGH_TO_LOW",
              "NONE"
            );

            expect(
              mockCategoryRepository.getCategoriesWithMetrics
            ).toHaveBeenCalledWith(
              2,
              20,
              "prog",
              "HIGH_TO_LOW",
              "NONE"
            );
          }
        );
      }
    );

    describe(
      "createCategory",
      () => {
        it(
          "should create category successfully",
          async () => {
            const payload = {
              category_name:
                "Programming",
            };

            mockCategoryRepository.findByName.mockResolvedValue(
              null
            );

            mockCategoryRepository.createCategory.mockResolvedValue(
              {
                category_id:
                  "cat-1",
                ...payload,
              }
            );

            const result =
              await categoriesService.createCategory(
                payload
              );

            expect(
              mockCategoryRepository.findByName
            ).toHaveBeenCalledWith(
              "Programming"
            );

            expect(
              mockCategoryRepository.createCategory
            ).toHaveBeenCalledWith(
              payload
            );

            expect(
              result.category_id
            ).toBe("cat-1");
          }
        );

        it(
          "should throw 409 when category already exists",
          async () => {
            mockCategoryRepository.findByName.mockResolvedValue(
              {
                category_id:
                  "existing",
              }
            );

            await expect(
              categoriesService.createCategory(
                {
                  category_name:
                    "Programming",
                }
              )
            ).rejects.toMatchObject(
              {
                statusCode: 409,
              }
            );

            expect(
              mockCategoryRepository.createCategory
            ).not.toHaveBeenCalled();
          }
        );
      }
    );

    describe(
      "updateCategoryName",
      () => {
        it(
          "should update category successfully",
          async () => {
            mockCategoryRepository.findById.mockResolvedValue(
              {
                category_id:
                  "cat-1",
              }
            );

            mockCategoryRepository.findByName.mockResolvedValue(
              null
            );

            mockCategoryRepository.updateCategoryName.mockResolvedValue(
              {
                category_id:
                  "cat-1",
                category_name:
                  "Backend",
              }
            );

            const result =
              await categoriesService.updateCategoryName(
                "cat-1",
                {
                  category_name:
                    "Backend",
                }
              );

            expect(
              mockCategoryRepository.updateCategoryName
            ).toHaveBeenCalledWith(
              "cat-1",
              {
                category_name:
                  "Backend",
              }
            );
      expect(result?.category_id).toBe("cat-1");
          }
        );

        it(
          "should throw 404 when category does not exist",
          async () => {
            mockCategoryRepository.findById.mockResolvedValue(
              null
            );

            await expect(
              categoriesService.updateCategoryName(
                "cat-1",
                {
                  category_name:
                    "Backend",
                }
              )
            ).rejects.toMatchObject(
              {
                statusCode: 404,
              }
            );
          }
        );

        it(
          "should throw 409 when another category already uses target name",
          async () => {
            mockCategoryRepository.findById.mockResolvedValue(
              {
                category_id:
                  "cat-1",
              }
            );

            mockCategoryRepository.findByName.mockResolvedValue(
              {
                category_id:
                  "cat-2",
              }
            );

            await expect(
              categoriesService.updateCategoryName(
                "cat-1",
                {
                  category_name:
                    "Backend",
                }
              )
            ).rejects.toMatchObject(
              {
                statusCode: 409,
              }
            );
          }
        );

        it(
          "should allow same category to keep its name",
          async () => {
            mockCategoryRepository.findById.mockResolvedValue(
              {
                category_id:
                  "cat-1",
              }
            );

            mockCategoryRepository.findByName.mockResolvedValue(
              {
                category_id:
                  "cat-1",
              }
            );

            mockCategoryRepository.updateCategoryName.mockResolvedValue(
              {
                category_id:
                  "cat-1",
              }
            );

            await categoriesService.updateCategoryName(
              "cat-1",
              {
                category_name:
                  "Backend",
              }
            );

            expect(
              mockCategoryRepository.updateCategoryName
            ).toHaveBeenCalled();
          }
        );
      }
    );

    describe(
      "deleteCategory",
      () => {
        it(
          "should delete category successfully",
          async () => {
            mockCategoryRepository.findById.mockResolvedValue(
              {
                category_id:
                  "cat-1",
              }
            );

            mockCategoryRepository.deleteCategory.mockResolvedValue(
              true
            );

            const result =
              await categoriesService.deleteCategory(
                "cat-1"
              );

            expect(
              mockCategoryRepository.deleteCategory
            ).toHaveBeenCalledWith(
              "cat-1"
            );

            expect(
              result
            ).toBe(true);
          }
        );

        it(
          "should throw 404 when category does not exist",
          async () => {
            mockCategoryRepository.findById.mockResolvedValue(
              null
            );

            await expect(
              categoriesService.deleteCategory(
                "cat-1"
              )
            ).rejects.toMatchObject(
              {
                statusCode: 404,
              }
            );

            expect(
              mockCategoryRepository.deleteCategory
            ).not.toHaveBeenCalled();
          }
        );
      }
    
  )});
