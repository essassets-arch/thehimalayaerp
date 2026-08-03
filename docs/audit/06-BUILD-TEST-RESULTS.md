# 06. Build & Test Results

Generated from actual execution of CI commands in the repository.

## Backend Lint
**Status:** ❌ Failed

<details>
<summary>Output</summary>

```

> backend@0.0.1 lint
> eslint "{src,apps,libs,test}/**/*.ts" --fix


D:\prototype-next-main\backend\src\common\decorators\current-user.decorator.ts
  5:11  error  Unsafe assignment of an `any` value           @typescript-eslint/no-unsafe-assignment
  6:5   error  Unsafe return of a value of type `any`        @typescript-eslint/no-unsafe-return
  6:20  error  Unsafe member access .user on an `any` value  @typescript-eslint/no-unsafe-member-access

D:\prototype-next-main\backend\src\common\filters\all-exceptions.filter.ts
  28:13  error  Unsafe assignment of an `any` value                               @typescript-eslint/no-unsafe-assignment
  30:7   error  Unsafe assignment of an `any` value                               @typescript-eslint/no-unsafe-assignment
  31:13  error  Unsafe member access .code on an `any` value                      @typescript-eslint/no-unsafe-member-access
  32:10  error  The two values in this comparison do not have a shared enum type  @typescript-eslint/no-unsafe-enum-comparison
  34:13  error  The two values in this comparison do not have a shared enum type  @typescript-eslint/no-unsafe-enum-comparison
  36:15  error  The two values in this comparison do not have a shared enum type  @typescript-eslint/no-unsafe-enum-comparison
  39:7   error  Unsafe assignment of an `any` value                               @typescript-eslint/no-unsafe-assignment
  39:21  error  Unsafe member access .message on an `any` value                   @typescript-eslint/no-unsafe-member-access
  41:29  error  Unsafe member access .message on an `any` value                   @typescript-eslint/no-unsafe-member-access
  43:9   error  Unsafe assignment of an `any` value                               @typescript-eslint/no-unsafe-assignment
  43:23  error  Unsafe member access .message on an `any` value                   @typescript-eslint/no-unsafe-member-access
  51:13  error  Unsafe assignment of an `any` value                               @typescript-eslint/no-
...[TRUNCATED]
```
</details>

## Backend Typecheck
**Status:** ✅ Passed

<details>
<summary>Output</summary>

```
No output
```
</details>

## Backend Build
**Status:** ✅ Passed

<details>
<summary>Output</summary>

```

> backend@0.0.1 build
> nest build


```
</details>

## Backend Tests
**Status:** ❌ Failed

<details>
<summary>Output</summary>

```

> backend@0.0.1 test
> jest


FAIL src/modules/audit/audit.service.spec.ts
  ● AuditService › should be defined

    Nest can't resolve dependencies of the AuditService (?). Please make sure that the argument PrismaService at index [0] is available in the RootTestModule module.

    Potential solutions:
    - Is RootTestModule a valid NestJS module?
    - If PrismaService is a provider, is it part of the current RootTestModule?
    - If PrismaService is exported from a separate @Module, is that module imported within RootTestModule?
      @Module({
        imports: [ /* the Module containing PrismaService */ ]
      })

    For more common dependency resolution issues, see: https://docs.nestjs.com/faq/common-errors

    [0m [90m  6 |[39m
     [90m  7 |[39m   beforeEach([36masync[39m () [33m=>[39m {
    [31m[1m>[22m[39m[90m  8 |[39m     [36mconst[39m module[33m:[39m [33mTestingModule[39m [33m=[39m [36mawait[39m [33mTest[39m[33m.[39mcreateTestingModule({
     [90m    |[39m                                   [31m[1m^[22m[39m
     [90m  9 |[39m       providers[33m:[39m [[33mAuditService[39m][33m,[39m
     [90m 10 |[39m     })[33m.[39mcompile()[33m;[39m
     [90m 11 |[39m[0m

      at TestingInjector.lookupComponentInParentModules (../../node_modules/@nestjs/core/injector/injector.js:300:19)
      at TestingInjector.resolveComponentWrapper (../../node_modules/@nestjs/testing/testing-injector.js:19:45)
      at resolveParam (../../node_modules/@nestjs/core/injector/injector.js:150:38)
          at async Promise.all (index 0)
      at TestingInjector.resolveConstructorParams (../../node_modules/@nestjs/core/injector/injector.js:179:27)
      at TestingInjector.loadInstance (../../node_modules/@nestjs/core/injector/injector.js:77:13)
      at TestingInjector.loadProvider (../../node_modules/@nestjs/core/injector/injector.js:111:9)
      at ../../node_modules/@nestjs/core/injector/instance-loader.js:56:13
          at async
...[TRUNCATED]
```
</details>

## Frontend Lint
**Status:** ❌ Failed

<details>
<summary>Output</summary>

```

> prototype-next@0.1.0 lint
> next lint


`next lint` is deprecated and will be removed in Next.js 16.
For new projects, use create-next-app to choose your preferred linter.
For existing projects, migrate to the ESLint CLI:
npx @next/codemod@canary next-lint-to-eslint-cli .


./app/(dashboard)/crm/leads/components/KanbanBoard.tsx
7:10  Warning: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
22:38  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
28:39  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
30:14  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars
89:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/(dashboard)/crm/leads/page.tsx
5:10  Warning: 'PageHeader' is defined but never used.  @typescript-eslint/no-unused-vars

./app/(dashboard)/crm/leads/[id]/page.tsx
15:36  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
22:14  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars
31:6  Warning: React Hook useEffect has a missing dependency: 'fetchLead'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
88:48  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/(dashboard)/crm/quotations/components/QuotationKanbanBoard.tsx
20:48  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
26:39  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
28:14  Warning: 'e' is defined but never used.  @typescript-eslint/no-unused-vars
83:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./app/(dashboard)/crm/quotations/[id]/page.tsx
23:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
32:14  Warning: 'e' is defined but never used.  @typescript-esli
...[TRUNCATED]
```
</details>

## Frontend Build
**Status:** ❌ Failed

<details>
<summary>Output</summary>

```

> prototype-next@0.1.0 build
> next build

   ▲ Next.js 15.5.20
   - Environments: .env.local, .env

   Creating an optimized production build ...

uncaughtException [Error: EPERM: operation not permitted, open 'D:\prototype-next-main\frontend\.next-build\trace'] {
  errno: -4048,
  code: 'EPERM',
  syscall: 'open',
  path: 'D:\\prototype-next-main\\frontend\\.next-build\\trace'
}
npm error Lifecycle script `build` failed with error:
npm error code 1
npm error path D:\prototype-next-main\frontend
npm error workspace prototype-next@0.1.0
npm error location D:\prototype-next-main\frontend
npm error command failed
npm error command C:\WINDOWS\system32\cmd.exe /d /s /c next build

```
</details>

