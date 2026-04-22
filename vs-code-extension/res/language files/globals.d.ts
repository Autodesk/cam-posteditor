/**
 * Autodesk CAM Post Processor API Type Declarations
 *
 * Provides IntelliSense and hover documentation for .cps / .cpi files.
 * Based on: https://cam.autodesk.com/posts/reference/
 *
 * Copyright (c) 2012-2026 by Autodesk, Inc.
 */

// ---------------------------------------------------------------------------
//  Vector
// ---------------------------------------------------------------------------

/** A 3-component vector (x, y, z). */
declare class Vector {
  constructor(x: number, y: number, z: number);
  /**
   * @see https://cam.autodesk.com/posts/reference/classVector.html#ace218f266acd8dace37dc0435050e5a8 */
  x: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a09bdaa33dfad57064cc500f3028928cf */
  y: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classVector.html#acec5b67a399720f1f7c91af248db231e */
  z: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a0439e89a2de913a6f18dc658938a9c6a */
  length: number;
  /** Returns the negated vector.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a052b5b17ed9217a8872a454a58fadca6 */
  getNegated(): Vector;
  /** Returns the normalized vector.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a181566143d332072b8dc20842ed6a082 */
  getNormalized(): Vector;
  /** Returns the vector with the absolute values of the coordinates.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a0ac54be3195d3c96e246d97ca3b09f3d */
  getAbsolute(): Vector;
  /** Returns the dot product with the given vector. */
  getProduct(v: Vector): number;
  /** Returns the value for the minimum coordinate.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a332f626a6dc38d1ac80d88ab89d96fef */
  getMinimum(): number;
  /** Returns the value for the maximum coordinate.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a991289050513df5c39ac0dff48dd5fe0 */
  getMaximum(): number;
  /** Returns the distance between the specified vectors.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#ac37fa14e4e12b22d9a3266fd53fe15f3 */
  getDistance(v: Vector): number;
  /** Returns the cross product of this vector and the specified vector.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a28d0ae466b64189b2f232b67a9601191 */
  cross(v: Vector): Vector;
  /** Returns the dot product of this vector and the specified vector.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a620c70151c5296b5452c0e27b284d765 */
  dot(v: Vector): number;
  /** Returns the sum of the specified vectors.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a25c065ede58b7f0ea340f7cf6b29fabe */
  static sum(a: Vector, b: Vector): Vector;
  /** Returns the difference of the specified vectors.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#acd2236a452042c9741e8d517fc590852 */
  static diff(a: Vector, b: Vector): Vector;
  /** Returns true if this vector equals v (within tolerance). */
  isEqual(v: Vector): boolean;
  /** Returns true if the vector is zero length. 'tolerance' is available:
   * @see https://cam.autodesk.com/posts/reference/classVector.html#add4c6aac27e5f88b9a863724b6b451b3 */
  isZero(): boolean;
  /** Returns true if the vector has non-zero length. 'tolerance' is available:
   * @see https://cam.autodesk.com/posts/reference/classVector.html#acbeaecea656a1608ccb1c29bec55851d */
  isNonZero(): boolean;
  /** Returns the specified coordinate (0:X, 1:Y, and 2:Z).
   * @see https://cam.autodesk.com/posts/reference/classVector.html#adbc6ca1067b35bda97dd744b6a5cb09a */
  getCoordinate(index: number): number;
  /** Sets the specified coordinate (0:X, 1:Y, and 2:Z).
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a576d03488f8331b1339a2941d25b8e9a */
  setCoordinate(index: number, value: number): void;
  toString(): string;
  /**
   * @see https://cam.autodesk.com/posts/reference/classVector.html#ab04248afc757e30863b328f3c41ee2ba */
  abs: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classVector.html#ab62e444bdfef86c1d7c19fd2a1985c37 */
  add(value: Vector): void;
  /** Returns true if two vectors are different.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a1e687aaa1d86142f78729dfe28de8eb0 */
  areDifferent(a: Vector, b: Vector, tolerance: number): boolean;
  /** Returns true if two vectors are parallel.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a465256212a7ccb547d65d4d10d5e5600 */
  areParallel(a: Vector, b: Vector, tolerance: number): boolean;
  /** Returns true if two vectors are perpendicular.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a7a4ec76ecdb53260c1b49728f43578ea */
  arePerpendicular(a: Vector, b: Vector, tolerance: number): boolean;
  /** Returns true if two vectors are in the same direction.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#ad548842729d0415467d45a1009c10484 */
  areSameDirection(a: Vector, b: Vector, tolerance: number): boolean;
  /** Divides the vector by the specified value.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a50988c1d2e7d9e749ba17fd33227ccef */
  divide(value: number): void;
  /** Returns the angle between the specified vectors.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a36112f07f7dc09771c04b6f8402c4a1e */
  getAngle(v1: Vector, v2: Vector): number;
  /** Returns the vector for the specified spherical coordinates.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a28b1d046a8faa7bf1580cf22a5a74df3 */
  getBySpherical(xyAngle: number, zAngle: number, radius: number): Vector;
  /** Returns the square of the distance between the specified vectors.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a0bde61d893167a7a47b3e27669bdfd96 */
  getDistance2(left: Vector, right: Vector): number;
  /** Returns the length of this vector.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#ab7d7f0c43fd26b5a4239a308cf30472b */
  getLength(): number;
  /** Returns the square length of this vector.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#acb58c45ac4278dadd4aa7fe4a1de125d */
  getLength2(): number;
  /** Returns the X coordinate.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#af4d34d33cac5b93f0df856e08326eff0 */
  getX(): number;
  /** Returns the angle in the X-Y plane (spherical coordinate).
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a5c5d491e766325d8573327d73e288eef */
  getXYAngle(): number;
  /** Returns the Y coordinate.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a4b8004fdcb462795655ef28c91f29afe */
  getY(): number;
  /** Returns the Z coordinate.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#adeb744c6572e41c2e62e3d0bea3cfe39 */
  getZ(): number;
  /** Returns the Z angle relative to the X-Y plane (spherical coordinate).
   * @see https://cam.autodesk.com/posts/reference/classVector.html#ad79952bed7d9e470f202770f006d2128 */
  getZAngle(): number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a289be8b5be32ace08e0a5671c24097aa */
  length2: number;
  /** Linear interpolation between the specified vectors. The U coordinate is clamped to the range [0; 1]. U equal to 0 and 1 corresponds to the left vector and the right vector, respectively.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#ab10e17f10c6c48a78069224c3a820303 */
  lerp(left: Vector, right: Vector, u: number): Vector;
  /** Multiplies the specified value.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#ab874e3743117ac603e69af6587cc65bf */
  multiply(value: number): void;
  /** Negates the vector.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#acca0e59aedeb60fe0ed4c2d5188f9ae5 */
  negate(): void;
  /**
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a1b4ca1d88a6d0039f0a5815800e8a95e */
  negated: Vector;
  /** Normalizes the vector.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a8189efe6c41ceba4084f6b074d4a47c0 */
  normalize(): void;
  /**
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a55c613bb61660d5457820e95f1423710 */
  normalized: Vector;
  /** Returns the distance between a point and a line of infinite length.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a1196f9807ac28448d670c2865d3fbdd6 */
  pointLineDistance(point: Vector, start: Vector, end: Vector): number;
  /** Returns the distance between a point and a plane.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#acf404d198c9a09e55060640cfbbf0079 */
  pointPlaneDistance(point: Vector, planePoint: Vector, planeNormal: Vector): number;
  /** Returns the distance between a point and a line segment. If the projected point is outside of the line segment, then the distance to the closest end point of the line segment is returned.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a2dc99981620f5a92bb440c7088239e1c */
  pointSegmentDistance(point: Vector, start: Vector, end: Vector): number;
  /** Returns the product of the specified vector and number.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a94f24a976f13b32811c8dc3012719e3e */
  product(left: Vector, right: number): Vector;
  /** Projects a point to a line of infinite length.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#abd60df81f8a8ab7156a4ee5a9948d009 */
  projectPointToLine(point: Vector, start: Vector, end: Vector): Vector;
  /** Projects a point to a plane.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#ae70262e6b8b4d5c42ca91ab17d2f355a */
  projectPointToPlane(point: Vector, planePoint: Vector, planeNormal: Vector): Vector;
  /** Sets the X coordinate.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a4a23cd9b43889730147c64f68a0b5d38 */
  setX(x: number): void;
  /** Sets the Y coordinate.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#accec1b58eaf464df1931e6430d426355 */
  setY(y: number): void;
  /** Sets the Z coordinate.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#ae177efdbb061fa0b21a99088740fb39c */
  setZ(z: number): void;
  /**
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a6f91179f0585cb189e02bf2eaa8586be */
  subtract(value: Vector): void;
  /** Returns the value converted from radians to degrees.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a26676b54bf0c9a24a7f4e58f2b5788b7 */
  toDeg(): Vector;
  /** Returns the value converted from degrees to radians.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#ac5115efb69bf952756c011f19b2a7b45 */
  toRad(): Vector;
  /** Translates a point along a vector at a given distance.
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a684c5473ce683dc7dfe0f8507a86b735 */
  translatePoint(point: Vector, vector: Vector, distance: number): Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classVector.html#a4df026156780bc0ca651c342b7d6daa4 */
  Vector(): void;
}

// ---------------------------------------------------------------------------
//  VectorPair
// ---------------------------------------------------------------------------

/** A pair of vectors. Returned by polar mode activation. */
declare class VectorPair {
  /** The first vector.
   * @see https://cam.autodesk.com/posts/reference/classVectorPair.html#ac5d1fe8f4a8c09e9ef49d52912f6aa99 */
  first: Vector;
  /** The second vector.
   * @see https://cam.autodesk.com/posts/reference/classVectorPair.html#ad0fd187f1135b5e598dabd16fa29a29f */
  second: Vector;
}

// ---------------------------------------------------------------------------
//  Matrix
// ---------------------------------------------------------------------------

/** A 3×3 rotation/orientation matrix. */
declare class Matrix {
  constructor();
  /** Returns the forward vector.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a6b85dfea153ea19ebafff8b18e4e323e */
  getForward(): Vector;
  /** Returns the up vector.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a973865c999f39920bfde03a1118eec38 */
  getUp(): Vector;
  /** Returns the right vector.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ada1540c9faf9d917ba9942a4c4be490e */
  getRight(): Vector;
  /** Returns the transposed matrix.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ab945f8eb3ec74c2fa02bf13861b049e6 */
  getTransposed(): Matrix;
  /** Returns the Euler angle for the specified convention in radians. Use getEuler2() instead to get the standard Euler conventions.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a6246077ce7c7dbeeb1375497b7fdada7 */
  getEuler(convention: number): Vector;
  /** Returns the Euler angle for the specified convention in radians.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a878b275c9092ae6b36eed27105ec377a */
  getEuler2(convention: number): Vector;
  /** Returns true if the matrix is the identity matrix.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#af5043e9a7453c21463cacaa14194331c */
  isIdentity(): boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ace38b63b959c2673986c3983e53f232b */
  multiply(m: Matrix): Matrix;
  /** Sets the X rotation in radians. */
  setXRotation(angle: number): void;
  /** Sets the Y rotation in radians. */
  setYRotation(angle: number): void;
  /** Sets the Z rotation in radians. */
  setZRotation(angle: number): void;
  /** Adds the specified matrix to this matrix.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a186320221235bad49299af90b068eefe */
  add(right: Matrix): void;
  /** Clamps the matrix elements to -1, 0, and -1 with the specified epsilon value.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a6a7e1ca9b18f54afb1f7242117bee0b2 */
  clamp(epsilon: number): void;
  /** Returns the difference between the specified matrices.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a9fd613f5b295a92894330445353ccfd8 */
  diff(left: Matrix, right: Matrix): Matrix;
  /** Euler conventions. Euler XZX static/world convention. Euler YXY static/world convention. Euler ZYZ static/world convention. Euler XZX body convention. Euler YXY body convention. Euler ZYZ body convention. Euler XZY static/world convention. Euler YXZ static/world convention. Euler ZYX static/world convention. Euler YZX body convention. Euler ZXY body convention. Euler XYZ body convention. Euler XYX static/world convention. Euler YZY static/world convention. Euler ZXZ static/world convention. Euler XYX body convention. Euler YZY body convention. Euler ZXZ body convention. Euler XYZ static/world convention. Euler YZX static/world convention. Euler ZXY static/world convention. Euler ZYX body convention. Euler XZY body convention. Euler YXZ body convention.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a8201930078e7093a95d507a1679873d8 */
  EulerConvention: enum;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ae8ae9d3e279ea023b5fe18d0271305f7 */
  eulerXYX: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a237998c6fe4a3c4aea3e8c58114fd305 */
  eulerXYX_R: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a6d3531f55809d5bf6772a56e3b52dd1c */
  eulerXYZ: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#aeaf5530091b5fc37767c07ef4dcd0daa */
  eulerXYZ_R: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#aa8fd37c42d0fd2098c54935a1bf503dd */
  eulerXZX: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a69ca5f2a3631e5f707c5dc5da8d7c720 */
  eulerXZX_R: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a88e42781876fc5304edc6ccd935c03ff */
  eulerXZY: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#af74441db169bdc70015e73f563f8fab0 */
  eulerXZY_R: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ad4b58933a1d04d9c1b050d7fa5ad63f1 */
  eulerYXY: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a41b01b1f2d2721b85abed4e97949545f */
  eulerYXY_R: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a7826e7703fda227006e0a2dd89868b81 */
  eulerYXZ: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ab27283d600424b83a8a7d9e3b75aa55a */
  eulerYXZ_R: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a495c578ae38f9f033dbb59edac02d2c2 */
  eulerYZX: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#af6ff1975f52f5dc71a1239d97e508192 */
  eulerYZX_R: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#afa0eb2845ad994449a49ce75945ae537 */
  eulerYZY: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a4ea73b7ee0e5f046eb5318c431aabbda */
  eulerYZY_R: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#aa98201187656c645ede5b2d60a849d8c */
  eulerZXY: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a7d07991b6fed29471a6d98f8839b74e0 */
  eulerZXY_R: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#acb7102c4f47926b74769be60e3a1064c */
  eulerZXZ: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ad224f71abbcf73d557ba414421aa2fa9 */
  eulerZXZ_R: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a48aa62c7a94e4dd32e9f63c5184caa2b */
  eulerZYX: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a2d81adec91dd4b63d58076c581918e9b */
  eulerZYX_R: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a425e597d3fb4b7723e74ff8ef341cf9b */
  eulerZYZ: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a9e594d24e7f76145e4f70a91c32c0632 */
  eulerZYZ_R: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a491693e77070c69cc98922ecb5894387 */
  forward: Vector;
  /** Returns the rotation matrix for the specified axis rotation.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#aa5893cf8e182b48a7bce236b9159c857 */
  getAxisRotation(axis: Vector, angle: number): Matrix;
  /** Returns the specified column.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a8d10d89032d493df1dcaab500d3eac79 */
  getColumn(column: number): Vector;
  /** Returns the value of the specified element.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a8a355744dff3c6bec8b22ff0885a4f88 */
  getElement(row: number, column: number): number;
  /** Returns the rotation for the specified Euler angles and convention.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a3b5999ad10c409d7a605407f2419e01e */
  getEulerRotation(convention: number, angles: Vector): Matrix;
  /** Returns the rotation matrix for the specified Euler rotation (XYX static convention). Angles are in radians.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ab4bf4d3f57181e17cb986f0d74b966ae */
  getEulerXYXRotation(angles: Vector): Matrix;
  /** Returns the Euler angles (XYZ convention) in radians. Use Matrix.getEuler2() instead.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a3193eb26d5aa877ab7e37480815b3a00 */
  getEulerXYZ(): Vector;
  /** Returns the rotation matrix for the specified Euler rotation (XYZ static convention). Angles are in radians.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a76b8b2371f9aa41373de2ac2b28e69a7 */
  getEulerXYZRotation(angles: Vector): Matrix;
  /** Returns the rotation matrix for the specified Euler rotation (XZX static convention). Angles are in radians.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a3504ef389f3ea0a095d1670b142a8b87 */
  getEulerXZXRotation(angles: Vector): Matrix;
  /** Returns the rotation matrix for the specified Euler rotation (XZY static convention). Angles are in radians.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a71ad98dd4e9025d30fa1d513d300320b */
  getEulerXZYRotation(angles: Vector): Matrix;
  /** Returns the rotation matrix for the specified Euler rotation (YXY static convention). Angles are in radians.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a35ac1ea701b6b92df4476a07c8ff519b */
  getEulerYXYRotation(angles: Vector): Matrix;
  /** Returns the rotation matrix for the specified Euler rotation (YXZ static convention). Angles are in radians.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a8cc218ac2aef889f482d2af7b3c2a2a7 */
  getEulerYXZRotation(angles: Vector): Matrix;
  /** Returns the rotation matrix for the specified Euler rotation (YZX static convention). Angles are in radians.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a4e1ea7eb00ea11e5dcdf7e783b787ba0 */
  getEulerYZXRotation(angles: Vector): Matrix;
  /** Returns the rotation matrix for the specified Euler rotation (YZY static convention). Angles are in radians.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a61f5304a3c39b16057ce85073dbf2962 */
  getEulerYZYRotation(angles: Vector): Matrix;
  /** Returns the rotation matrix for the specified Euler rotation (ZXY static convention). Angles are in radians.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a5a00382e5f9d0d3a88d852f5bfe47136 */
  getEulerZXYRotation(angles: Vector): Matrix;
  /** Returns the Euler angles (ZXZ convention) in radians. Use Matrix.getEuler2() instead.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ad2b5e93b9732b44cc9b982f0d0816129 */
  getEulerZXZ(): Vector;
  /** Returns the rotation matrix for the specified Euler rotation (ZXZ static convention). Angles are in radians.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a3c60f73321e1ba388805c9e64acf57da */
  getEulerZXZRotation(angles: Vector): Matrix;
  /** Returns the Euler angles (ZYX convention) in radians. Use Matrix.getEuler2() instead.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a0aa77aa386fe879b11e68e047c0d94b2 */
  getEulerZYX(): Vector;
  /** Returns the rotation matrix for the specified Euler rotation (ZYX static convention). Angles are in radians.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a6e240312fc0fa052e66f5dbdf6ec20fc */
  getEulerZYXRotation(angles: Vector): Matrix;
  /** Returns the Euler angles (ZYZ convention) in radians. Use Matrix.getEuler2() instead.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a69dd1a51af1b5cbcd4d404951c2a4938 */
  getEulerZYZ(): Vector;
  /** Returns the rotation matrix for the specified Euler rotation (ZYZ static convention). Angles are in radians.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a529afe8835a3da0396e44bd8257d4a38 */
  getEulerZYZRotation(angles: Vector): Matrix;
  /** Return N1 of this matrix.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a03af6ab7285a58fde43073a45d81cd34 */
  getN1(): number;
  /** Return N2 of this matrix.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#abb4392de40966c607634c48154bff4ef */
  getN2(): number;
  /** Returns the negated matrix.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a45be07bfe7b6c66252f01f9713b17139 */
  getNegated(): Matrix;
  /** Returns a matrix that satisfies the supplied forward vector. Since only a single vector is supplied the resultant matrix can be rotated at any angle around the forward vector.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a9d1d65da725ad7c264ee7739aa1ac188 */
  getOrientationFromDirection(forward: Vector): Matrix;
  /** Returns the specified row.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ae023bb5ac5677b80504a3094d4528b89 */
  getRow(row: number): Vector;
  /** Returns the X and Y rotations around the fixed frame to match the forward direction. Primary and secondary specifies the preferred rotations and must be different.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a02a4fa4c70fdbb4fa3ada59a70970358 */
  getTiltAndTilt(primary: number, secondary: number): Vector;
  /** Returns the X, Y, Z rotations around the fixed frame to match the forward direction. Primary and secondary specifies the preferred rotations and must be different.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a7e25eb02a717a8093300819afacdf19a */
  getTurnAndTilt(primary: number, secondary: number): Vector;
  /** Returns the matrix for the specified X-axis rotation. The matrix will rotate the vector and not the frame.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ac6110fba76c73a2c7ba1c30297b919a0 */
  getXRotation(angle: number): Matrix;
  /** Returns the matrix for the specified X, Y, and Z rotations. The matrix will rotate the vector and not the frame. The order of the rotations are X, Y, and then Z.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a55454f768ad98a138b54de49f729e3a6 */
  getXYZRotation(abc: Vector): Matrix;
  /** Returns the matrix for the specified Y-axis rotation. The matrix will rotate the vector and not the frame.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a563b76c3d4dcf16096d92088526f8b8f */
  getYRotation(angle: number): Matrix;
  /** Returns the matrix for the specified Z-axis rotation. The matrix will rotate the vector and not the frame.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ab273f7a5fe29102c94b6a5747a538f52 */
  getZRotation(angle: number): Matrix;
  /** Returns true if the matrix is the zero matrix (i.e. all elements are set to 0).
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#abf9699327654381ed53f7f86ae44a0a0 */
  isZero(): boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a3aede62f513da27e6f61ae7a972b4f96 */
  Matrix(): void;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ad12cc1e600a46d8dd487c26e475f8ea0 */
  n1: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ae0c17b89cc64d0ce760933a1401ea84e */
  n2: number;
  /** Negates this matrix.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#acca0e59aedeb60fe0ed4c2d5188f9ae5 */
  negate(): void;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a8e3fe8a31a1dcf6c1f8a96e65c6c5d66 */
  negated: Matrix;
  /** Normalizes the orientation.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a8189efe6c41ceba4084f6b074d4a47c0 */
  normalize(): void;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a7716819fe87b8543a9c61ba8b389e5f6 */
  right: Vector;
  /** Rotates this matrix around the X-axis by the specified angle.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a43f6ba2835da044cefee72cff81cf15d */
  rotateX(angle: number): void;
  /** Rotates this matrix around the Y-axis by the specified angle.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#aceecd09dbee7147e948fb0b4c847d7a9 */
  rotateY(angle: number): void;
  /** Rotates this matrix around the Z-axis by the specified angle.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a6670f810acf64dfa00fcb2f92c087dc9 */
  rotateZ(angle: number): void;
  /** Sets the specified column.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a724f25fae31cda083da93bda12857e70 */
  setColumn(column: number, value: Vector): void;
  /** Sets the value of the specified element.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#af8f38bd82843d8f9236dbca0ce0e9825 */
  setElement(row: number, column: number, value: number): void;
  /** Sets the forward vector.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a3bc8d49673bd4b0b173e8660fdd3a348 */
  setForward(value: Vector): void;
  /** Sets the right vector.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ad7af03cd22901a400cfadb6681e946f7 */
  setRight(value: Vector): void;
  /** Sets the specified row.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a4a3bda9c13ffaba5b68fe97041d61620 */
  setRow(row: number, value: Vector): void;
  /** Sets the up vector.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#af8bce18125ed2e4578fbf0cfbe98c44b */
  setUp(value: Vector): void;
  /** Subtracts the specified matrix from this matrix.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a6d1fe8f588f11373c6245594a757a63d */
  subtract(right: Matrix): void;
  /** Returns the difference between the specified matrices.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#af6deb364f9f816dea3ba99fd44b3394b */
  sum(left: Matrix, right: Matrix): Matrix;
  /** Converts the matrix to a string (e.g. [[1, 2, 3], [4, 5, 6], [7, 8, 9]]).
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#ad146fa8579a5f8a876c4688cc5a68520 */
  toString(): string;
  /** Transposed this matrix.
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a66491f281b2dea60b17f584178c62a8b */
  transpose(): void;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a812c09704893188bb78f3ea70c3a8845 */
  transposed: Matrix;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMatrix.html#a1535083f1ae95887ffb07e7b6c796c00 */
  up: Vector;
}

// ---------------------------------------------------------------------------
//  Range
// ---------------------------------------------------------------------------

/** A numeric range with minimum and maximum values. */
declare class Range {
  /** Returns the minimum value.
   * @see https://cam.autodesk.com/posts/reference/classRange.html#a332f626a6dc38d1ac80d88ab89d96fef */
  getMinimum(): number;
  /** Returns the maximum value.
   * @see https://cam.autodesk.com/posts/reference/classRange.html#a991289050513df5c39ac0dff48dd5fe0 */
  getMaximum(): number;
  /** Returns true if the range is non-degenerate. */
  isNonDegenerate(): boolean;
  /** Returns the nearest value which is in the range.
   * @see https://cam.autodesk.com/posts/reference/classRange.html#afac99a497b49eb196c333bd89d25ad13 */
  clamp(value: number): number;
  /** Expands the range to include the specified value.
   * @see https://cam.autodesk.com/posts/reference/classRange.html#adbef2569f0217c056f49ab3bd1b53cc1 */
  expandTo(value: number): void;
  /** Expands the range to include the specified range.
   * @see https://cam.autodesk.com/posts/reference/classRange.html#a8e24befba3eb0d35ab777e1f6eb2a9c4 */
  expandToRange(value: Range): void;
  /** Returns the middle of the range.
   * @see https://cam.autodesk.com/posts/reference/classRange.html#a52f60a4399f904b5da8c1bf7aca820b6 */
  getMiddle(): number;
  /** Returns the span of the range.
   * @see https://cam.autodesk.com/posts/reference/classRange.html#ad25f999762324e8153092a1622b6e0d1 */
  getSpan(): number;
  /** Returns the U coordinate for the specified value. 0 and 1 corresponds to the minimum and maximum, respectively.
   * @see https://cam.autodesk.com/posts/reference/classRange.html#af24c8443eb485ef50b778dd767059219 */
  getU(value: number): number;
  /** Grows the range by the specified offset.
   * @see https://cam.autodesk.com/posts/reference/classRange.html#a1ab37d76b99287f612cd6078d5ff59ad */
  grow(offset: number): void;
  /** Returns true if the range is a non-range.
   * @see https://cam.autodesk.com/posts/reference/classRange.html#a4669524d2afea549b2d1f1008c501a89 */
  isNonRange(): boolean;
  /** Returns true if the specified value is within the range.
   * @see https://cam.autodesk.com/posts/reference/classRange.html#aa5afeb3184ae4150031742ae6aebfda9 */
  isWithin(value: number): boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classRange.html#af2c9e85f45336a2b49fc63f67187e598 */
  maximum: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classRange.html#a10e369b2a960ccb7acfb741aa870ee12 */
  middle: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classRange.html#ade0381d0c23e72f36d1288ea43caa35a */
  minimum: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classRange.html#afa61e339c5d7dd76c25663fc2718da8a */
  Range(): void;
  /** Reduces the range by the specified offset. Returns the middle of the range if the range collapses.
   * @see https://cam.autodesk.com/posts/reference/classRange.html#a9fa08ace350ec6e85e78bd90ae2fea1b */
  reduce(offset: number): void;
  /**
   * @see https://cam.autodesk.com/posts/reference/classRange.html#a3d3dec8b92a82b3bb6695fb4ef37eb7a */
  span: number;
  /** Converts the range to a string (e.g. [-10.5; 5.75]).
   * @see https://cam.autodesk.com/posts/reference/classRange.html#ad146fa8579a5f8a876c4688cc5a68520 */
  toString(): string;
  /** Translates the range.
   * @see https://cam.autodesk.com/posts/reference/classRange.html#a4d1fe53127e994cd2f216d56295b6832 */
  translate(offset: number): void;
}

// ---------------------------------------------------------------------------
//  BoundingBox
// ---------------------------------------------------------------------------

/** An axis-aligned bounding box. */
declare class BoundingBox {
  /** The lower corner.
   * @see https://cam.autodesk.com/posts/reference/classBoundingBox.html#ace4d9096e0c7e80e5b666a169b9225a7 */
  lower: Vector;
  /** The upper corner.
   * @see https://cam.autodesk.com/posts/reference/classBoundingBox.html#a015c66b8475a94cc8c7bea2687afb081 */
  upper: Vector;
  /** Returns the X range. */
  getXRange(): Range;
  /** Returns the Y range. */
  getYRange(): Range;
  /** Returns the Z range. */
  getZRange(): Range;
  /**
   * @see https://cam.autodesk.com/posts/reference/classBoundingBox.html#a1dea7b72431cc6891cefdb6020af2bd6 */
  BoundingBox(): void;
  /** Compares two bounding boxes. Returns The return values are:
   * @see https://cam.autodesk.com/posts/reference/classBoundingBox.html#a8124ef194fb3cc568cadeadfe23896de */
  compare(box1: BoundingBox, box2: BoundingBox, tolerance: number): number;
  /** Expands the bounding box to include the specified position.
   * @see https://cam.autodesk.com/posts/reference/classBoundingBox.html#ae2c8cf4015c02bc098193a081a7352e1 */
  expandTo(point: Vector): void;
  /** Expands the bounding box to include the specified bounding box.
   * @see https://cam.autodesk.com/posts/reference/classBoundingBox.html#a3385d5738b0c03937aa6e9645649a04a */
  expandToBox(box: BoundingBox): void;
  /** Gets intersection between the bounding box and a ray. Returns Pair of intersection points. First intersection point is where the ray enters the bounding box. Second point, where the ray exits from the bounding. If ray's origin is inside the bounding box, first point is equal to second. Returns null, if the ray does not intersect the bounding box.
   * @see https://cam.autodesk.com/posts/reference/classBoundingBox.html#a2a5fccfd9fc93832d8c79400dea4deea */
  getRayIntersection(origin: Vector, direction: Vector, expansion=Vector(): Vector): VectorPair;
}

// ---------------------------------------------------------------------------
//  FormatNumber
// ---------------------------------------------------------------------------

/** A number formatter created with `createFormat()`. */
declare class FormatNumber {
  /** Returns the string for the specified value.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a47d304db32feae2b6dbfb5281c153460 */
  format(value: number): string;
  /** Returns the resulting value for the specified value.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a166a0e4651cfd340ad9c4821f4ec5ff5 */
  getResultingValue(value: number): number;
  /** Returns true if the specified values are different when formatted.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a9c3731e4b924de08aaf5f9874fcdf19a */
  areDifferent(a: number, b: number): boolean;
  /** Returns the minimum number of decimals. */
  getMinimumDecimals(): number;
  /** Returns the number of decimals.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a5c4df02e03d825f493f2fa2281d722aa */
  getNumberOfDecimals(): number;
  /** Returns the error for the specified value.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a97fe207bd0215da0b566a90012b5f397 */
  getError(value: number): number;
  /** Returns true if this format uses a signed representation. */
  isSignedFormat(): boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a13baff698f18687e21371dcfd07acec1 */
  base: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a2979d74f37380151584de8d898ed8376 */
  cyclicLimit: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a43fdbb786f9b189dedf953171a849f54 */
  cyclicSign: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a38c6ffbad18790ebc33edce3e0386529 */
  decimals: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#aadb62f3b0a83695d9355b3ef4c53f311 */
  decimalSymbol: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#ad30fe98bd8f7f130839af8fe10433526 */
  forceDecimal: boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a8dafd4122ee580d2c07ecdc53f7f7486 */
  forceSign: boolean;
  /** Constructs a number formatting object.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a5fe3a008c4db0b5dbe4dcba0069faff8 */
  FormatNumber(): void;
  /** Returns the base number.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a5ef3b74a48bcb856b1bb6c7a2d4a3899 */
  getBase(): number;
  /** Returns the cyclic limit. Deprecated since r45877.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a4ff678cee9122c1f3452451e8466f899 */
  getCyclicLimit(): number;
  /** Returns the cyclic sign. Deprecated since r45877.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a0536ad6c45d6c081233b6ce28b52066f */
  getCyclicSign(): number;
  /** Returns the decimal separator.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#ac7b91328f424a489a9a7c15531d30bca */
  getDecimalSymbol(): number;
  /** Returns the force decimal flag. Deprecated since r45877.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#ac28ab2afbe7a59cb60efa83f1255a026 */
  getForceDecimal(): boolean;
  /** Returns the force sign flag.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#ad4ee88237bbdd78d0b3a6cccd6a5819a */
  getForceSign(): boolean;
  /** Returns the maximum allowed value.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a991289050513df5c39ac0dff48dd5fe0 */
  getMaximum(): number;
  /** Returns the minimum number of digits to the left of the decimal point.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a02b223313aacedb6ef306fc37f2ef329 */
  getMinDigitsLeft(): number;
  /** Returns the minimum number of digits to the right of the decimal point.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a1e68c5413ba104ee3f9dd011add73bcf */
  getMinDigitsRight(): number;
  /** Returns the minimum allowed value.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a332f626a6dc38d1ac80d88ab89d96fef */
  getMinimum(): number;
  /** Returns the minimum epsilon value. Returns 1 for no decimals, 0.1 for 1 decimal and so forth.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#ac5583f54a65c09ea1ae59a7f726771b5 */
  getMinimumValue(): number;
  /** Returns the offset.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#ac41ba5ae7681519310daea5cd166d09d */
  getOffset(): number;
  /** Returns the prefix.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a5b9a69b246225ec2eca3637f32437a16 */
  getPrefix(): string;
  /** Returns the scale.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#ab8fb002cbfa60fb42c8e995d9996f4b4 */
  getScale(): number;
  /** Returns the suffix.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a1631180214cf2035ed389688b47a9999 */
  getSuffix(): string;
  /** Returns true if the leading zero should be skipped. Deprecated since r45877.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#ab0bd96372031e873b28028bd29b41525 */
  getTrimLeadZero(): boolean;
  /** Returns true if the suffix zero decimals should be skipped. Deprecated since r45877.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a15c450f0f6b132c331682f70d974c663 */
  getTrimZeroDecimals(): boolean;
  /** Returns the type of formatted value.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a367706e675179342e6153c45f1ba06ae */
  getType(): number;
  /** Returns the width. Deprecated since r45877.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#aaea5f36f63d6c8ff03ce8f69df432cd0 */
  getWidth(): number;
  /** Returns the zero padding mode. Deprecated since r45877.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a08fc587fc037806b453db516dfcdc200 */
  getZeroPad(): boolean;
  /** Returns true if the specified value would be non-zero when formatted. When comparing 2 values use areDifferent() instead.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a6d4c05e6bfa14960dc88e636a0d440a3 */
  isSignificant(value: number): boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#af2c9e85f45336a2b49fc63f67187e598 */
  maximum: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a74ee86372a1d7cc44879d2311bdff8ef */
  minDigitsLeft: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a3fc2e26041e84d584b8f788c7b9c0d42 */
  minDigitsRight: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#ade0381d0c23e72f36d1288ea43caa35a */
  minimum: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#af6e880f23938f34eeb6aac9e2e8e22e9 */
  offset: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a2e478046ff478a74f698443104e2100d */
  prefix: string;
  /** Returns the value after cyclic mapping, scaling, and offset.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a3bac27160ab8c925d98b87b518bdcf05 */
  remap(value: number): number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a8d6d8c10a0cff7c180f5d9e72b399461 */
  scale: number;
  /** Sets the base number.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a10a9bbb82690610522f741fd377925b0 */
  setBase(base: number): void;
  /** Sets the cyclic mapping. For sign -1 the values will be mapped to the range [-cyclicLimit; 0] For sign 0 the values will be mapped to the range [-cyclicLimit; cyclicLimit] For sign 1 the values will be mapped to the range [0; cyclicLimit] The cyclic mapping is done before scaling and offset. Deprecated since r45877.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#ab91a3e82665e5b0ed19da62ba6cf8ca0 */
  setCyclicMapping(limit: number, sign: number): void;
  /** Sets the decimal separator.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a0351c3e9089cbe0b7b4a821ccbdd90a4 */
  setDecimalSymbol(decimalSymbol: number): void;
  /** Sets the force decimal flag. Deprecated since r45877.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#ac9259f3ef69400fc7a38d5e76a60375e */
  setForceDecimal(forceDecimal: boolean): void;
  /** Sets the force sign flag.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a4cb608fbe8833f13286a46faeed6e7a3 */
  setForceSign(forceSign: boolean): void;
  /** Sets the maximum allowed value.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#aaac21bbfbb41bfdee2ce27997edd2fb7 */
  setMaximum(value: number): void;
  /** Sets the minimum number of digits to the left of the decimal point.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a967f43b544d947d03ab3ad9bbf9a2b01 */
  setMinDigitsLeft(value: number): void;
  /** Sets the minimum number of digits to the right of the decimal point.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#ab6c0c482f60defcfca9ecb45ade9a450 */
  setMinDigitsRight(value: number): void;
  /** Sets the minimum allowed value.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a94ac8177b4961b62e0d3f3db554742f9 */
  setMinimum(value: number): void;
  /** Sets the number of decimals.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a17966168ce7f291212da70181ced7439 */
  setNumberOfDecimals(numberOfDecimals: number): void;
  /** Sets the offset.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a87e594c274a2137ddeae6d59c2c3ff0f */
  setOffset(offset: number): void;
  /** Sets the prefix.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#aa2ead425f673596916d2707c04179ba0 */
  setPrefix(prefix: string): void;
  /** Sets the scale.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a97b3668429662804ce9980d2338945fa */
  setScale(scale: number): void;
  /** Sets the suffix.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a6dac5b6f495d6e830d1f10d6baa55457 */
  setSuffix(suffix: string): void;
  /** Sets the skip leading zero flag. Deprecated since r45877.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a70d7ae691d7534ff4b0394539144f590 */
  setTrimLeadZero(trimLeadZero: boolean): void;
  /** Sets the skip zero decimals flag. Deprecated since r45877.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a881714aa56d00b6c86805ed4c9aeeace */
  setTrimZeroDecimals(trimZeroDecimals: boolean): void;
  /** Sets the type of formatted value. Can be FORMAT_INTEGER, FORMAT_REAL, FORMAT_LZS, FORMAT_TZS.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a60b1ac24efd326d38ada6a82cf9a22d7 */
  setType(type: number): void;
  /** Sets the width. Deprecated since r45877.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a9a7f44bcf8d92dc95472f147841152c1 */
  setWidth(width: number): void;
  /** Sets zero padding mode. Deprecated since r45877.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a17fc42d2714bd8402dc653d189dea1f1 */
  setZeroPad(zeroPad: boolean): void;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a2c910a23da2f7ff2597870e38f7ae17c */
  suffix: string;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#aa5bf668ef1849bd121adc3c61fb2c48e */
  trimLeadZero: boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#abace11dee969cf89465c45b8c0e1467d */
  trimZeroDecimals: boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#aad47b2bea93c44c35072171d3e1caf72 */
  type: number;
  /** Returns the value after removing the any scaling and offset factors.
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a28cebe760b19ac32157014d64e98f150 */
  unmap(value: number): number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a5bcc5800828d4b8f5aab4bb9a2896b64 */
  width: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classFormatNumber.html#a388d56f8ce8003cfd7ea25aed6ca3279 */
  zeroPad: boolean;
}

/** An alias for FormatNumber. */
declare type Format = FormatNumber;

// ---------------------------------------------------------------------------
//  OutputVariable / Variable / Modal / IncrementalVariable / ReferenceVariable
// ---------------------------------------------------------------------------

/** An output variable created with `createOutputVariable()`. Combines a prefix, format, and force logic. */
declare class OutputVariable {
  /** Returns the formatted string of the specified value. An empty string can be returned based on the control setting.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a47d304db32feae2b6dbfb5281c153460 */
  format(value: number): string;
  /** Returns the last formatted value.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a4a02b6111800712eacf8767fa7f19be3 */
  getCurrent(): number;
  /** Invoke to force output of value on the next invocation of format(). reset() has no effect if control has been set to force for the given format.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a4a20559544fdf4dcb457e258dc976cf8 */
  reset(): void;
  /** Disable the variable from being output. When invoked format() always returns an empty string.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a545341e59cc9a0dafc4e265d60d4b5d6 */
  disable(): void;
  /** Enables the variable for output.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a91e658a6e3fccc3028f2d71122bc4b8f */
  enable(): void;
  /** Returns the prefix.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a714ee7d4b0b74920b9874e216d238901 */
  getPrefix(): string;
  /** Sets the prefix.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#ac9870919332b35e610be51a3fd81ba8f */
  setPrefix(prefix: string): void;
  /** Returns the base number of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a6c751541fb56da7716780df339b60f87 */
  getBase(): any;
  /** Returns the output control.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a451c838d57c9219a7bc1ea5fe8aae77f */
  getControl(): any;
  /** Returns the cyclic limit.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a4e1c668c84d5ba2b99aed3d48b8ca4bb */
  getCyclicLimit(): any;
  /** Returns the cyclic sign.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a38f062c7abf43805df73cccdf76d13ec */
  getCyclicSign(): any;
  /** Returns the decimal separator of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a03bfc6c534397ee19ab4fb2365ef8211 */
  getDecimalSymbol(): string;
  /** Returns the force sign flag of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#ad4ee88237bbdd78d0b3a6cccd6a5819a */
  getForceSign(): boolean;
  /** Returns the format attached to the variable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#ae3861cb27c3a7a02c15612e63c4a4ae6 */
  getFormat(): FormatNumber;
  /** Returns the type of formatted value of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a14bd59e16d473d5dc9dbeffe34e9943e */
  getFormatType(): any;
  /** Returns the maximum allowed value of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#ad51cb65269f6c1f5bafc2725724c11ab */
  getMaximum(): any;
  /** Returns the minimum number of digits to the left of the decimal point of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a8630d36b83592584d91f14f55f7a1f24 */
  getMinDigitsLeft(): any;
  /** Returns the minimum number of digits to the right of the decimal point of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a469218a25afc2f920835ed37c2fbe44d */
  getMinDigitsRight(): any;
  /** Returns the minimum allowed value of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a29792add4930a5ee8518aa51655db37a */
  getMinimum(): any;
  /** Returns the number of decimals of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a0a087c31ce80dbe719e902ad9855554e */
  getNumberOfDecimals(): any;
  /** Returns the offset of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a9d41dac31dd12db9a371929e4ac563f5 */
  getOffset(): any;
  /** Returns the resulting value as if it was formatted for the variable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a6eeacceeee54fa7893286aa32e102158 */
  getResultingValue(): any;
  /** Returns the scale of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#ae6a07ec47087b7ca0447519d9f7a0d00 */
  getScale(): any;
  /** Returns the suffix.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#ae0d7da0179d2215e7a1b8a47c243e45b */
  getSuffix(): any;
  /** Returns the output tolerance for the variable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#abc053e83016f887a730febe53bd74187 */
  getTolerance(): any;
  /** Returns the type.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a6801f942e308cf2f8906f624ab99d03d */
  getType(): any;
  /** Returns true if the variable is enabled.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a8f0546e83514d6d10458185eed4b1194 */
  isEnabled(): boolean;
  /** Constructs an output variable. The supported specifiers are:
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#ad368f662807c8225f8700db14bee5a9b */
  OutputVariable(specifiers: any, format: FormatNumber): void;
  /** Sets the base number of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#aadb602d5444f7f9569fb527fa4fed187 */
  setBase(base: any): void;
  /** Sets the variable output control. Can be CONTROL_CHANGED, CONTROL_FORCE, or CONTROL_NONZERO.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a91d0fb68335c914ad890d392ae435a2f */
  setControl(control: any): void;
  /** Sets the current value for the variable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a46aa60643a245e8a8be1ea0478b054bf */
  setCurrent(current: any): void;
  /** Sets the cyclic limit.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#acacd6e2ea3ef970c024969672675e83a */
  setCyclicLimit(cyclicLimit: any): void;
  /** Sets the cyclic sign. Can be -1, 0, 1.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#aabdafcdd6e145dbc1ab28511f28ca0b8 */
  setCyclicSign(cyclicLimit: any): void;
  /** Sets the decimal separator of the FormatNumber associated with the OutputVariable..
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a519db8890effeaba53832e10f3eb0807 */
  setDecimalSymbol(decimalSymbol: string): void;
  /** Sets the force sign flag of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a4cb608fbe8833f13286a46faeed6e7a3 */
  setForceSign(forceSign: boolean): void;
  /** Assigns a format to the variable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#abeb0f6cd07bf62a7b05f9d5cd60c628d */
  setFormat(format: any): void;
  /** Sets the type of formatted value of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#aee67d058d26ab536cb41a61a9d0c6b44 */
  setFormatType(type: any): void;
  /** Sets the maximum allowed value of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#ae25610fe708f7f83d379698302936413 */
  setMaximum(maximum: any): void;
  /** Sets the minimum number of digits to the left of the decimal point of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a199a177cea8b1c6761ed91949c6f6316 */
  setMinDigitsLeft(minDigitsLeft: any): void;
  /** Sets the minimum number of digits to the right of the decimal point of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a66e9c4e23ade7633aef674f252346f67 */
  setMinDigitsRight(minDigitsRight: any): void;
  /** Sets the minimum allowed value of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#afe0853689894f51eae859fced413656a */
  setMinimum(minimum: any): void;
  /** Sets the number of decimals of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a02818501520e0c0ade40ed0061e333b7 */
  setNumberOfDecimals(numberOfDecimals: any): void;
  /** Sets the offset of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#aef547f163fa9ada55eb7687f9d5fe135 */
  setOffset(offset: any): void;
  /** Sets the scale of the FormatNumber associated with the OutputVariable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#aa191b2f74337cdac9c70bbbab149c23d */
  setScale(scale: any): void;
  /** Sets the suffix.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#af67bd154abf5a442320056a8dfdbde8a */
  setSuffix(suffix: any): void;
  /** Sets the output tolerance for the variable.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#afc88e2c923b7bc5ad67f660345324d57 */
  setTolerance(tolerance: any): void;
  /** Sets the variable type. Can be TYPE_ABSOLUTE, TYPE_INCREMENTAL, or TYPE_DIRECTIONAL.
   * @see https://cam.autodesk.com/posts/reference/classOutputVariable.html#a268a30a4bd2a7dea29a4b8325506d55c */
  setType(type: any): void;
}

/** A simple modal variable created with `createVariable()`. */
declare class Variable {
  /** Returns the formatted string of the specified value. The empty string is returned if the value is identical to the last formatted value.
   * @see https://cam.autodesk.com/posts/reference/classVariable.html#a47d304db32feae2b6dbfb5281c153460 */
  format(value: number): string;
  /** Returns the last formatted value.
   * @see https://cam.autodesk.com/posts/reference/classVariable.html#a4a02b6111800712eacf8767fa7f19be3 */
  getCurrent(): number;
  /** Invoke to force output of value on the next invocation of format(). reset() has no effect if force has been set to true for the given format.
   * @see https://cam.autodesk.com/posts/reference/classVariable.html#a4a20559544fdf4dcb457e258dc976cf8 */
  reset(): void;
  /** Disable variable. When invoked format() always returns the empty string.
   * @see https://cam.autodesk.com/posts/reference/classVariable.html#a545341e59cc9a0dafc4e265d60d4b5d6 */
  disable(): void;
  /** Returns the prefix.
   * @see https://cam.autodesk.com/posts/reference/classVariable.html#a714ee7d4b0b74920b9874e216d238901 */
  getPrefix(): any;
  /** Sets the prefix.
   * @see https://cam.autodesk.com/posts/reference/classVariable.html#ac9870919332b35e610be51a3fd81ba8f */
  setPrefix(prefix: any): void;
  /** Constructs a variable. The supported specifiers are:
   * @see https://cam.autodesk.com/posts/reference/classVariable.html#a3677a3d9984872a7e7b4d928a6d28017 */
  Variable(specifiers: any, format: FormatNumber): void;
}

/** A modal value with a string prefix, created with `createModal()`. */
declare class Modal {
  /** Returns the corresponding string. If the value is identical to the last value then the empty string is returned unless the force specifier has been set to true.
   * @see https://cam.autodesk.com/posts/reference/classModal.html#adacd5a8f139e7218812ca1dbc88d166f */
  format(value: number): string;
  /** Returns the last formatted value.
   * @see https://cam.autodesk.com/posts/reference/classModal.html#a4a02b6111800712eacf8767fa7f19be3 */
  getCurrent(): number;
  /** Invoke to force output of value on the next invocation of format(). reset() has no effect if force has been set to true .
   * @see https://cam.autodesk.com/posts/reference/classModal.html#a4a20559544fdf4dcb457e258dc976cf8 */
  reset(): void;
  /** Returns the prefix.
   * @see https://cam.autodesk.com/posts/reference/classModal.html#a714ee7d4b0b74920b9874e216d238901 */
  getPrefix(): string;
  /** Sets the prefix.
   * @see https://cam.autodesk.com/posts/reference/classModal.html#ac9870919332b35e610be51a3fd81ba8f */
  setPrefix(prefix: string): void;
  /** Returns the suffix.
   * @see https://cam.autodesk.com/posts/reference/classModal.html#ae0d7da0179d2215e7a1b8a47c243e45b */
  getSuffix(): any;
  /** Constructs a modal variable. The supported specifiers are:
   * @see https://cam.autodesk.com/posts/reference/classModal.html#a557a14c90e66a4172c417fd930471f0b */
  Modal(specifiers: any, format: FormatNumber): void;
  /** Sets the suffix.
   * @see https://cam.autodesk.com/posts/reference/classModal.html#af67bd154abf5a442320056a8dfdbde8a */
  setSuffix(suffix: any): void;
}

/** A modal group that enforces mutual exclusivity among multiple modals. */
declare class ModalGroup {
  /** Returns the formatted code. Code must be defined in strict mode. If code is not defined in non-strict mode than the codes is output always.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a55862887d2144afd722f2bd1d1ab1952 */
  format(index: number, value: number): string;
  /** Resets all groups.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a4a20559544fdf4dcb457e258dc976cf8 */
  reset(): void;
  /** Adds the specified code to the given group.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a63d1a20284164fd42a6713c1164b67a3 */
  addCode(group: number, code: number): void;
  /** Creates a new group.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#ad48e381769b51c1bc831b811e4e711b0 */
  createGroup(): number;
  /** Disables the output.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a545341e59cc9a0dafc4e265d60d4b5d6 */
  disable(): void;
  /** Enables the output.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a91e658a6e3fccc3028f2d71122bc4b8f */
  enable(): void;
  /** Returns the active code in the specified group.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a6cd868c8fc45d347d4b5a87c4db10a35 */
  getActiveCode(group: number): number;
  /** Returns the group id for the specified code. Returns 0 if unknown id.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#ac7da1b891a1dac925d83a3d8a03bb46e */
  getGroup(code: number): number;
  /** Returns the total number of defined codes.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a6c1080ad013e6aa866b7ff8f7f6a43d6 */
  getNumberOfCodes(): number;
  /** Returns the number of codes in the specified group.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a11f55e9270215c750ced2708821c3ae1 */
  getNumberOfCodesInGroup(group: number): number;
  /** Returns the number of groups.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#acffab17f5eb805b3885a0da821542fb2 */
  getNumberOfGroups(): number;
  /** Returns true if the specified group has an active code.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a811072ee395e75aab977be9156e51ec1 */
  hasActiveCode(group: number): boolean;
  /** Returns true if the specified codes are in the same group. Returns false is either code is unknown.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a735decc8dc72c20f110ee46ea27d4e95 */
  inSameGroup(a: number, b: number): boolean;
  /** Returns true if the specified code is active within its group.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a13d0c527ebccba98924baef5106bdcc5 */
  isActiveCode(code: number): boolean;
  /** Returns true if the specified code is defined.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a6476190ee3cd85da9e1017a16bf33750 */
  isCodeDefined(code: number): boolean;
  /** Returns true if enabled.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a8f0546e83514d6d10458185eed4b1194 */
  isEnabled(): boolean;
  /** Returns true if the specified group is a valid group.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a777ccd564724b9e15b74d5b411f5eb22 */
  isGroup(group: number): boolean;
  /** Marks the specified code as active within its group.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#af75662a015949aab818428a48785d058 */
  makeActiveCode(code: number): void;
  /** Construct a new modal group.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a212e7149f40c33cf7191e48810f95f0a */
  ModalGroup(): void;
  /** Removes the specified code.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#ade0e61c1494087acf141c7924886ef89 */
  removeCode(code: number): void;
  /** Resets the specified group. Returns the active code. Returns -1 if no code is active.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a2e55def317f6d701146b2740500d80ef */
  resetGroup(group: number): number;
  /** Sets the auto-reset mode. All groups are reset if an undefined code is output. Only appplies in non-strict mode.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a24fc1aec78d903156ed689e7c40214f9 */
  setAutoReset(autoreset: boolean): void;
  /** Sets the force mode.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#ad025e21ececece8a2cbc3a837a494052 */
  setForce(force: boolean): void;
  /** Sets the format.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a37e5d07a86c150f327111dc5ed32ccbd */
  setFormatNumber(formatNumber: FormatNumber): void;
  /** Enables output of for use of undefined codes. Only on the first usage.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a9945673b45b8998c5f7214082ec17104 */
  setLogUndefined(logundefined: boolean): void;
  /** Sets the prefix.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#aa2ead425f673596916d2707c04179ba0 */
  setPrefix(prefix: string): void;
  /** Sets the strict mode.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a1547d8cd4d91e11461991a454833f52b */
  setStrict(strict: boolean): void;
  /** Sets the suffix.
   * @see https://cam.autodesk.com/posts/reference/classModalGroup.html#a6dac5b6f495d6e830d1f10d6baa55457 */
  setSuffix(suffix: string): void;
}

/** An incremental variable created with `createIncrementalVariable()`. */
declare class IncrementalVariable {
  /** Returns the formatted string of the specified value. The empty string is returned if the value is identical to the last formatted value.
   * @see https://cam.autodesk.com/posts/reference/classIncrementalVariable.html#a47d304db32feae2b6dbfb5281c153460 */
  format(value: number): string;
  /** Returns the last formatted value.
   * @see https://cam.autodesk.com/posts/reference/classIncrementalVariable.html#a4a02b6111800712eacf8767fa7f19be3 */
  getCurrent(): number;
  /** Invoke to force output of value on the next invocation of format(). reset() has no effect if force has been set to true for the given format.
   * @see https://cam.autodesk.com/posts/reference/classIncrementalVariable.html#a4a20559544fdf4dcb457e258dc976cf8 */
  reset(): void;
  /** Disable variable. When invoked format() always returns the empty string.
   * @see https://cam.autodesk.com/posts/reference/classIncrementalVariable.html#a545341e59cc9a0dafc4e265d60d4b5d6 */
  disable(): void;
  /** Returns the prefix.
   * @see https://cam.autodesk.com/posts/reference/classIncrementalVariable.html#a714ee7d4b0b74920b9874e216d238901 */
  getPrefix(): any;
  /** Constructs a variable. The supported specifiers are:
   * @see https://cam.autodesk.com/posts/reference/classIncrementalVariable.html#a454e0c0edecf4c524fd7409256cda7a2 */
  IncrementalVariable(specifiers: any, format: FormatNumber): void;
  /** Sets the prefix.
   * @see https://cam.autodesk.com/posts/reference/classIncrementalVariable.html#ac9870919332b35e610be51a3fd81ba8f */
  setPrefix(prefix: any): void;
}

/** A reference variable created with `createReferenceVariable()`. */
declare class ReferenceVariable {
  /** Returns the formatted string of the specified value. The empty string is returned if the value is identical to the specified reference value. The reference value is optional. If not specified the value will be output.
   * @see https://cam.autodesk.com/posts/reference/classReferenceVariable.html#af848186d021b7aea0b4ba3a04d607f17 */
  format(value: number): string;
  /** Returns the current value. */
  getCurrent(): number;
  /** Resets the variable. */
  reset(): void;
  /** Disable variable. When invoked format() always returns the empty string.
   * @see https://cam.autodesk.com/posts/reference/classReferenceVariable.html#a545341e59cc9a0dafc4e265d60d4b5d6 */
  disable(): void;
  /** Returns the prefix.
   * @see https://cam.autodesk.com/posts/reference/classReferenceVariable.html#a714ee7d4b0b74920b9874e216d238901 */
  getPrefix(): any;
  /** Constructs a variable. The supported specifiers are:
   * @see https://cam.autodesk.com/posts/reference/classReferenceVariable.html#a8e270f66ceca31945c2a17269a4f259c */
  ReferenceVariable(specifiers: any, format: FormatNumber): void;
  /** Sets the prefix.
   * @see https://cam.autodesk.com/posts/reference/classReferenceVariable.html#ac9870919332b35e610be51a3fd81ba8f */
  setPrefix(prefix: any): void;
}

// ---------------------------------------------------------------------------
//  Tool
// ---------------------------------------------------------------------------

/** Represents a cutting tool.
 * @see https://cam.autodesk.com/posts/reference/classTool.html */
declare class Tool {
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a32796ce1888ba28e0bd71417afe2cbfb */
  number: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#aad47b2bea93c44c35072171d3e1caf72 */
  type: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a4850b7b86ea5fd1ca10e8a5211c76dd3 */
  turret: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#afaefa953868322d5fed8c4b5cd5e6ace */
  diameter: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a883116f38585cfd486c7ee3d81f4ea23 */
  cornerRadius: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a53bdcc67d3054221a0277f93fd9e5df1 */
  taperAngle: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a7e86b351d448a7d6da9a10d0e91db69a */
  fluteLength: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a605268f6f291415dd34cce9b265c9511 */
  shoulderLength: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a3554ace51af39a724721c6458d954c31 */
  shaftDiameter: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ae14c019f23a6b1b324575d2226a16bd7 */
  bodyLength: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a2cee2e10cce0f6de0604c19eb182115b */
  overallLength: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ab0ab0963d144e427f54d210037dbc70a */
  numberOfFlutes: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a84621689750d08f596e9cc301ba43de5 */
  threadPitch: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a93a097851e69da5ad3832b85229b4ed0 */
  coolant: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a5b592ca082170de20df49490bdb90191 */
  material: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a22386f6c0cd06cc2f997b379be42b8cb */
  comment: string;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a0e91253390b868169cfe091c815515b5 */
  vendor: string;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#aba11d209386a6941c2e0261da0f3307a */
  productId: string;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#aa63cd118027e6af31ecb0a9a45085e43 */
  unit: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a90037814f06c038285a1c842cb23161d */
  diameterOffset: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ac7b7dc5710fd37d236f3bb4b2e69c223 */
  lengthOffset: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a591439058218b7cc6537121c62101480 */
  compensationOffset: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a394d01d75d9cd745a93ff5578e225256 */
  breakControl: boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a23ce5a934c513a3a91414e3873c3c139 */
  manualToolChange: boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a8993ca4766e5b2bf8b28129b0ae22ee9 */
  liveTool: boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a3b48625fdc344b44df1989c64b3e4cd0 */
  spindleRPM: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a2e8dde0f0d9fd49b8ff281a2aa598422 */
  rampingSpindleRPM: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a168ff808159da44ab7261a10cc58699d */
  surfaceSpeed: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a4a5151faeecc6d2a15e5e75ea42bb0a4 */
  maximumSpindleSpeed: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a94cfda21a2a28a580551a3fd39298fbd */
  spindleMode: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a0810276e06656c851495fc716d2ee571 */
  holderNumber: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a1e65883f83b7e1430dfb3c4b99d834d9 */
  holderTipDiameter: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a853636c2602daae166af8f589c36ad64 */
  holderDiameter: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ae233b113c2645492c18fb060ccc05196 */
  holderLength: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#acb888a0f5d5d2faf29e7868e1e651631 */
  boringBarOrientation: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a570e0531633f1d28fadd71d07d0ef9f4 */
  noseRadius: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a015d5af61f9ec864634e5852e1fc9153 */
  inscribedCircleDiameter: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#adc680e8fa215f9f3cea2888f2b4278f5 */
  edgeLength: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a4d7fb2d78d254270434548498c65c8fd */
  reliefAngle: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ac61e6183228447dc88ba0d4566500dfa */
  grooveWidth: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#abf02d05306336b1713e5158cf7aae25e */
  crossSection: string;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#aa709133dd735cfc77553e28023fd73c0 */
  hand: string;
  /** Returns the tip diameter.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ab9e659807e2b819d8b7ac2b6405d706e */
  getTipDiameter(): number;
  /** The jet distance.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#addab8bc8ea5add285f670038a986923d */
  jetDistance: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a95c169487117efd3eac5ef5c45175d92 */
  jetDiameter: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a459bd1d2b58fa7dd7a428c84eedec847 */
  kerfWidth: number;

  /** Returns the tool number.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a1e6e4e2baecd083efd0cbaeef64d733a */
  getNumber(): number;
  /** Returns the tool type. The types are:
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a367706e675179342e6153c45f1ba06ae */
  getType(): number;
  /** Returns the cutter diameter.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a99b2b61f5696e0cf3f36f3ef61cafe8e */
  getDiameter(): number;
  /** Returns the corner radius.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a3040ea6310b2fed4e222ecdca40b4471 */
  getCornerRadius(): number;
  /** Returns the flute length.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a9a47fd916fe301f17a6e69d39a23baec */
  getFluteLength(): number;
  /** Returns the shoulder length.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#aae18419a80348857ba15f6f0fa074648 */
  getShoulderLength(): number;
  /** Returns the shaft diameter.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a5e2acd5a77b4b8808f0428f788542b3c */
  getShaftDiameter(): number;
  /** Returns the body length.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a4d35e9d589bede0da8bc2ba2e72db5f1 */
  getBodyLength(): number;
  /** Returns the entire length of the tool.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a2dcdae2342b08bb2794074b635a93b4f */
  getOverallLength(): number;
  /** Returns the taper angle in radians.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a2cd939019540e068461416f363a0bbe6 */
  getTaperAngle(): number;
  /** Returns the number of flutes.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a3eee84fb60cb96a0f8733e8f6bc729e2 */
  getNumberOfFlutes(): number;
  /** Returns the tapping feedrate as spindle RPM * thread pitch.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#aaba58042abe6c31e6f92471125d99b27 */
  getTappingFeedrate(): number;
  /** Returns the coolant mode.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#aec42a72d28eadbc54ca85c030d8e0f96 */
  getCoolant(): number;
  /** Returns the material.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ac6cfe4e3061b6c9e2dfcba607518d87b */
  getMaterial(): number;
  /** Returns the tool description.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ac7feffb7a33f63504ff1f87f19e2d2d8 */
  getDescription(): string;
  /** Returns the tool comment.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a50a7366cba8ce27bc48a00e746324f7b */
  getComment(): string;
  /** Returns the tool vendor.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a302cede76897f855726f58e5778ddc17 */
  getVendor(): string;
  /** Returns the tool product id.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a86a79749e7c6ac31371386206d802e1d */
  getProductId(): string;
  /** Returns true if the tool is a turning tool.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ac6b2ea2768cad085e41062e4322e0ec5 */
  isTurningTool(): boolean;
  /** Returns true if the tool is a jet tool.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a0216a21c013b576a9a09c813e6b398a8 */
  isJetTool(): boolean;
  /** Returns true if the tool is a drill.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a4e1a602c62da3f902d53f074a28af116 */
  isDrill(): boolean;
  /** Returns true if the spindle rotates in clockwise direction.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a14747147268151dbc30cd3e56fd3a004 */
  isClockwise(): boolean;
  /** Returns true if the tool is live. Otherwise tool is static (ie. mounted without a spindle).
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a1185d423b6747cd60da100a549520e6d */
  isLiveTool(): boolean;
  /** Returns the spindle speed in RPM (rotations per minute).
   * @see https://cam.autodesk.com/posts/reference/classTool.html#aefa4d4cdeb5e2a679c94fc60b61fdf85 */
  getSpindleRPM(): number;
  /** Returns the ramping spindle speed in RPM (rotations per minute).
   * @see https://cam.autodesk.com/posts/reference/classTool.html#aa1698f3e276712d83fcdca18df3a7917 */
  getRampingSpindleRPM(): number;
  /** Returns the surface speed (CSS).
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a097c8a3dcded0f757938339d84738e24 */
  getSurfaceSpeed(): number;
  /** Returns the maximum spindle speed (RPM) when using surface speed (CSS).
   * @see https://cam.autodesk.com/posts/reference/classTool.html#abaee13713dded943cecf1fd20d89cea1 */
  getMaximumSpindleSpeed(): number;
  /** Returns the diameter offset.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a6c28436f89b26d0ccb2656a9c706e275 */
  getDiameterOffset(): number;
  /** Returns the length offset.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a6a2c8f2fc7204d6b75002dd6233e73b1 */
  getLengthOffset(): number;
  /** Returns the tool unit. The available values are:
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a31c63ecd5c7503de4ee4257f97eecea4 */
  getUnit(): number;
  /** Returns the holder number.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a046ef50362ef0708cfbaba6909f1fef7 */
  getHolderNumber(): number;
  /** Returns the boring bar orientation in radians.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a6305cc0bb6ca10315c08e6e024e65161 */
  getBoringBarOrientation(): number;
  /** Returns the number of threads per unit of length.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#afb6840d4ba85432d6e35a0446629cd4c */
  getThreadPitch(): number;
  /** Returns the tool id. Note: it is an internal (unique) id of the tool in a Fusion/Inventor document. For instance, when adding/creating a tool (not exist) in the document, a new id is created for the tool, which is added into the document's tool library.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ad32a40d40b22d91083bdec805aedf2e9 */
  getToolId(): string;
  /** Returns the holder description.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#aa4b1cd68c94f9c0cf0cd58fb51664db3 */
  getHolderDescription(): string;
  /** Returns the holder comment.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a419efc6d5263b6933862602233a8e7cd */
  getHolderComment(): string;
  /** Returns the holder vendor.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a82c2d76ddf992b1e6df084875fbef294 */
  getHolderVendor(): string;
  /** Returns the holder product id.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a425419b3498344b246454f09dda2477c */
  getHolderProductId(): string;
  /** Returns the turning compensation mode. The available modes are:
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a23fac185f81ed97cc5069b5f5d86671d */
  getCompensationMode(): number;
  /** Returns the turning insert type. The available types are:
   * @see https://cam.autodesk.com/posts/reference/classTool.html#aa77b996f3159e0d380f5ef3aeb262222 */
  getInsertType(): number;
  /** Returns the turning holder type. The available types are:
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a927333d7c7c25ad1b00221f54f3f0cfd */
  getHolderType(): number;
  /** Returns the turret for turning.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ac23eb146a195c224baab95bd56f34ea3 */
  getTurret(): number;
  /** Returns the assembly gauge length.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a4099af0238d0f58e2bc92555e2ffd096 */
  getAssemblyGaugeLength(): number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a2999ce8d63a8d7dc6438424fb9d7e92f */
  abrasiveFlowRate: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a7be376264c3d783d9d2dc2e238aa3643 */
  assistGas: string;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a6ee8b904b221746b91ff1725fb5ede48 */
  clamping: string;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a1a04bfe607e5f2d6fc5c7edb47c304f1 */
  cutHeight: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ae1017e1269bdb7b3461d7c9beb752e04 */
  cutPower: number;
  /** Returns The abrasive flow rate for waterjet operations.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ab66f6bd5cf3c2429253022f86958186f */
  getAbrasiveFlowRate(): number;
  /** Returns the aggregate id.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a62ff7857ca32ed92ef6d08c6b2d0d3fb */
  getAggregateId(): string;
  /** Returns The name of the assist gas used for laser/plasma operations.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a400b4bd0f48db6bea8cb96703d553ea9 */
  getAssistGas(): string;
  /** Returns true if break control is enabled.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a86edcd3a9a57525d13d284db1373e745 */
  getBreakControl(): boolean;
  /** Returns the turning compensation displacement for the toolpath. The Z-coordinate is always 0.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#aa63093f399576b6e44bdfdcda4a8dbbe */
  getCompensationDisplacement(): Vector;
  /** Returns the primary compensation offset for turning.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ac9fab15745b2afdbc737102033dd6009 */
  getCompensationOffset(): number;
  /** Returns The height above the material to cut at for waterjet/laser/plasma operations.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#af65181f1e8118e5645b165e8181389a5 */
  getCutHeight(): number;
  /** Returns The power used for cutting the material for laser/plasma operations.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a0c220373419c0c4341d2845e16042ef7 */
  getCutPower(): number;
  /** Returns the cutter as a mesh.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a33281e78eb7e4de0bfbffa3dca1a5f39 */
  getCutterAsMesh(tolerance: number): Mesh;
  /** Returns the profile of the cutter as a Curve.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a7085aa756bfa09b79bbcd0386e20f75d */
  getCutterProfile(): Curve;
  /** Returns the SVG profile of the cutter.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a0379f6cd9e527b29f03a9fce0341e6fa */
  getCutterProfileAsSVGPath(): string;
  /** Returns the tool extent.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ac96757dc025bfbf39c063690add9abfd */
  getExtent(includeHolder: boolean): BoundingBox;
  /** Returns the holder.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#acae6f04f48e76c36885a2be1ad17942b */
  getHolder(): Holder;
  /** Returns the holder as a mesh.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#af6e1800a22bba6e8e814d614f83414c9 */
  getHolderAsMesh(tolerance: number): Mesh;
  /** Returns the maximum holder diameter.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a51f7d9df32238146ed4209a0efb1bcd2 */
  getHolderDiameter(): number;
  /** Returns the total holder length.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a55bb4fd78885182d0e559246bc728168 */
  getHolderLength(): number;
  /** Returns the profile of the holder as a Curve.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a694e0c2a8e58385443920a16b7a578b5 */
  getHolderProfile(): Curve;
  /** Returns the SVG profile of the holder.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ac49f5a8bd5e3368e1c8bbc3530bd5321 */
  getHolderProfileAsSVGPath(): string;
  /** Returns the tip diameter of the holder.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#aa2958c0f88bba4843ed5c719309d8aaf */
  getHolderTipDiameter(): number;
  /** Returns the ISO/ANSI insert code for turning tool.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a6ce612f6b2bbb764c5392b90fa7dfdaa */
  getInsertStandardCode(): string;
  /** Returns The waterjet/laser/plasma nozzle diameter.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a293cbdc9c16c05a623b4024a9ba2a6e1 */
  getJetDiameter(): number;
  /** Deprecated (not used).
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a45151e83c2cfdd64fc8c2209b14fe9fb */
  getJetDistance(): number;
  /** Returns The waterjet/laser/plasma kerf width.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a744f70d615cd5a8188cfe1b8c21698e7 */
  getKerfWidth(): number;
  /** When set to "manual" the programmed feedrates will be used, "automatic" will disable feedrate output and the machine control will handle the feedrates of the toolpaths. The post processor must support this setting for "automatic " to have any effect on the output.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#abcf73e3e89723c32646b1d53013db76f */
  getMachineQualityControl(): string;
  /** Returns true if the tool must be manually changed.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a0d6e003e4850013aabeb4cea3d041256 */
  getManualToolChange(): boolean;
  /** Returns The height above the material to pierce the material for laser/plasma operations.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a760cde8139bb68a78c7335912b199e85 */
  getPierceHeight(): number;
  /** Returns The power used for piercing the material for laser/plasma operations.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a8f48db8df3752e639322fa12c8919a87 */
  getPiercePower(): number;
  /** Returns The amount of time used to pierce the material for waterjet/laser/plasma operations
   * @see https://cam.autodesk.com/posts/reference/classTool.html#af3c87912e3732d1986068fdd28bf4024 */
  getPierceTime(): number;
  /** Returns The water pressure for waterjet operations and gas pressure for laser/plasme operations.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a28e1c4567ad70efe42597dbfc579c4f1 */
  getPressure(): number;
  /** Returns the secondary compensation offset for turning.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a6b3664f649fc3edf7ca485a40b176a0a */
  getSecondaryCompensationOffset(): number;
  /** Returns the secondary length offset.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a45509e162cced23b0fc27ab5f381d26a */
  getSecondaryLengthOffset(): number;
  /** Returns the shaft.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#aad749ab89f28b4b7f1802d9fa4b9c3e9 */
  getShaft(): Shaft;
  /** Returns the spindle mode. The available modes are:
   * @see https://cam.autodesk.com/posts/reference/classTool.html#aed01c76a45dbf6cfe02471427dbfa833 */
  getSpindleMode(): number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a8d97a3188342b0267b3537d384a39699 */
  holder: Holder;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#add041665a588c1941cdba6158de7a69d */
  machineQualityControl: string;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a5b68b1f992bdc7b072e174e90d444840 */
  pierceHeight: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a7edbab505440088144931e0ecc3917bd */
  piercePower: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#affecb615b6f29c07a90c9d41387b63af */
  pierceTime: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a8a1b46cb5044c7cd0e018233970a2b55 */
  pitch: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a619f24d46bd3b52a89fde6d4bf483b52 */
  pressure: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a861b9962820a7efabcd8455788f626df */
  shaft: Shaft;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#ab4da2a86cbeb791802a641f7ffea303e */
  thickness: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a683b837f8d4b804774921d5731050841 */
  tolerance: string;
  /** Constructs a tool.
   * @see https://cam.autodesk.com/posts/reference/classTool.html#a3e3b9ae7de928ae23af64fedd3a25952 */
  Tool(): void;
}

// ---------------------------------------------------------------------------
//  Section
// ---------------------------------------------------------------------------

/** An NC section — a group of NC data sharing the same work plane, tool, and related data.
 * @see https://cam.autodesk.com/posts/reference/classSection.html */
declare class Section {
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aa63cd118027e6af31ecb0a9a45085e43 */
  unit: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a87bed12c1f6f717bd5f0221c2fb4148c */
  workOrigin: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a8259795a8bbe3b812e0b261d455fb67e */
  workPlane: Matrix;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a5c95527b960ea406d87a7abf72a8e357 */
  wcsOrigin: Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a90afc9b58ce976de5f531c2a052aa503 */
  wcsPlane: Matrix;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a0a7200bedd5fbbfc8a5669e86f1484b6 */
  workOffset: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a3641cd5a2787c05fef68e39d9f2daea5 */
  probeWorkOffset: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a33f694d5bacb3510c778265d8434867b */
  wcsIndex: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a74e36eab80768ee61d18b900fbd49099 */
  wcs: string;
  /** The dynamic work offset corresponding to the WCS used for controlling the display coordinates.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a81fab6934a375ca7ff97bb1c15598bae */
  dynamicWorkOffset: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a109aded60ae90aab42ea4d8eaec1a127 */
  axisSubstitution: boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a23c1d04a8ab6b95dd7489cef786f5919 */
  axisSubstitutionRadius: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aad47b2bea93c44c35072171d3e1caf72 */
  type: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aeb4e7a355a6aa79a348441c0d2c5519f */
  quality: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a5e61f6c52cc3227d82e6c6e79bb86044 */
  tailstock: boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#af3edb9a5b9c87cd8c40ed21609726f75 */
  partCatcher: boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a8a889a78ff1c2e681c71438750be5a19 */
  spindle: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aae5487c7ece843c6214db228848916cb */
  properties: any;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a6d2d21fd2e5fe3853cc894a61a5589b8 */
  strategy: string;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a119b5f816f4b2a1e83d132e0efcab22a */
  machiningType: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a447fec2effe7c634d6cd9b0cd275d667 */
  polarDirection: Vector;

  /** Returns the zero-based id of the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a929e1325a515b279faca90a65028782e */
  getId(): number;
  /** Returns the tool.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aa78f578697808e53c1b4a2836b940933 */
  getTool(): Tool;
  /** Returns the original unit of the section. This may be different from the output unit. The available values are:
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a31c63ecd5c7503de4ee4257f97eecea4 */
  getUnit(): number;
  /** Returns the type of the section. The available types are:
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a367706e675179342e6153c45f1ba06ae */
  getType(): number;
  /** Returns true is the section contains multi-axis toolpath.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a3d5394a2f705c338f3b8ff9303958cff */
  isMultiAxis(): boolean;
  /** Returns the content flags.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#af502596f1859f2abce33770ad9101512 */
  getContent(): number;
  /** Returns the work origin in the WCS.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#acc759d9094fe705cf848c97f2e3a81de */
  getWorkOrigin(): Vector;
  /** Returns the work plane in the WCS.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a37f16dba2547dfc87c3616825dde1c03 */
  getWorkPlane(): Matrix;
  /** Returns the origin of the WCS.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a22521f3d7fb29c63e493051588d80a55 */
  getWCSOrigin(): Vector;
  /** Returns the WCS plane.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ad30ba4813712d8456b0927e80383314d */
  getWCSPlane(): Matrix;
  /** Returns the work offset for the WCS.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aea18ce7ffef1c43f0885695bc8f7fa67 */
  getWorkOffset(): number;
  /** Returns the WCS code string. If there is no WCS definition defined or the work offset is out of range, it will return an empty string.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a26c9b6b3ce9745c4439988d0e240ebfc */
  getWCS(): string;
  /** Returns the WCS code index (without format). If there is no WCS definition defined or the work offset is out of range, it will return -1.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aa3449d1667829254910d8a1e34bee347 */
  getWCSIndex(): number;
  /** Returns the tool axis coordinate index (0:X, 1:Y, and 2:Z).
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a0fa109ceeef686715d4441ba562f2f22 */
  getToolAxis(): number;
  /** Returns the first position for the section. This method has been replaced by getInitialPosition().
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a3ded4db9f7c7f84d1099cfefccd67d6e */
  getFirstPosition(): Vector;
  /** Returns the initial position for the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a42c41b2d2d4de8706cf07c0b4b081243 */
  getInitialPosition(): Vector;
  /** Returns the final position for the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a73e82326e02d4b6e71bccd1ba4ef7c3c */
  getFinalPosition(): Vector;
  /** Returns the initial tool axis for the section as the direction vector.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aafadc5fe6b920dc00e90d87e3dff4cf3 */
  getInitialToolAxis(): Vector;
  /** Returns the initial tool axis for the section in the WCS frame. Always returns the direction vector.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#af35b52ef4e0436a88985c2e5a246ae68 */
  getGlobalInitialToolAxis(): Vector;
  /** Returns the initial tool axis machine angles for the section. The section must have been optimized for the machine using optimizeMachineAngles() or similar before called this method.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a396f8d06a014c8626e3fcc25ea33a66e */
  getInitialToolAxisABC(): Vector;
  /** Returns the final tool axis for the section as the direction vector.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aca0a2c3959e6868f70385a7fe70e8c78 */
  getFinalToolAxis(): Vector;
  /** Returns the final tool axis machine angles for the section. The section must have been optimized for the machine using optimizeMachineAngles() or similar before called this method.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ae787e288f3db488ef6131ee73382a75b */
  getFinalToolAxisABC(): Vector;
  /** Returns true if the spindle speed is on initially. Might be turned off due to initial canned cycle when it starts with positioning moves.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a69b849db87674939aaeb179ef0da8c71 */
  getInitialSpindleOn(): boolean;
  /** Returns the initial spindle speed which can be different from the tool spindle speed. Might be turned off due to initial canned cycle.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a65f4ea163e38285b512c41695831719e */
  getInitialSpindleSpeed(): number;
  /** Returns the Z-coordinate range of the toolpath of the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ae4d1cc9ab6e25aa6913004a1aff7ea93 */
  getZRange(): Range;
  /** Returns the Z-coordinate range of the toolpath of the section in the global coordinate system.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aafcc549b67d4fa4751c86d9a61700748 */
  getGlobalZRange(): Range;
  /** Returns the bounding box of the toolpath of the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a169e7523b55544ef7318225610b62b91 */
  getBoundingBox(): BoundingBox;
  /** Returns the bounding box of the toolpath of the section in the global coordinate system.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a75b9c0d755c95d85a138f6a4adf16d8a */
  getGlobalBoundingBox(): BoundingBox;
  /** Returns the maximum feedrate for the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a85d50cd78571d385825d6d79cfd82825 */
  getMaximumFeedrate(): number;
  /** Returns the maximum spindle speed for the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#abaee13713dded943cecf1fd20d89cea1 */
  getMaximumSpindleSpeed(): number;
  /** Returns the cutting distance for the section (excluding rapid traversal).
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a218a879f8c93e8165aafea10bafd987a */
  getCuttingDistance(): number;
  /** Returns the rapid traversal distance for the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ac7976e633c8c7e155ac2c44fa57e498e */
  getRapidDistance(): number;
  /** Returns the cycle time for the cutting moves the section (rapid traversal is ignored).
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a6b72a3abc57330bdd2803fd9200595ff */
  getCycleTime(): number;
  /** Returns the number of records in the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ae8f19b78b3e40375f7beaeaeab195df9 */
  getNumberOfRecords(): number;
  /** Returns the specified record within the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a0a2b6f4236b1d7ffa123d6a49a149791 */
  getRecord(id: number): Record;
  /** Returns the number of cycle points for the entire section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a4b3cdd32aafe3c3c798bb082c6867bbe */
  getNumberOfCyclePoints(): number;
  /** Returns the movements (as a mask) in use for the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a0224736487c609a5a580caf20762cadb */
  getMovements(): number;
  /** Returns the maximum tilt in the range [-1; 1] for the given multi-axis section. 1 corresponds to 0deg tilt. -1 corresponds to 180deg tilt.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a9fcde7a7cce59923fb1f4adc67f4d324 */
  getMaximumTilt(): number;
  /** Returns true if the specified parameter has been defined in the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#af023fd31344206b149bafc7650e0c940 */
  hasParameter(name: string): boolean;
  /** Returns the value of the first occurrence of the specified parameter.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a70f41a777c780feefe35deee5fddf2ea */
  getParameter(name: string, defaultValue?: any): any;
  /** Returns true if the specified cycle occurs anywhere within the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a2cff911af0ba6f3f5a124903fc970025 */
  hasCycle(uri: string): boolean;
  /** Returns true if the section has any cycle.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a6194aeee3f5ca1c4bb84e770916a97fc */
  hasAnyCycle(): boolean;
  /** Returns the number cycles within the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ae675e6bc03c4f010c7adebe082a233af */
  getNumberOfCycles(): number;
  /** Returns true if tool change should be forced.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#af83da0253b2e113aa882ccd31e6f2ee3 */
  getForceToolChange(): boolean;
  /** Returns the job id of the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ab1b6940c2d990a755dd373994c2ff9be */
  getJobId(): number;
  /** Returns the pattern id of the section. You can use this to tell which sections are pattern instances of the same original section. The motion coordinates will be identical for patterned sections but the work plane can be different. Note that, the pattern ids can be different for some types of patterns when the actual motion coordinates are mapped. Returns 0 means that the section is not patterned.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a88bd9ecd153985b92c4e40cd1fa83619 */
  getPatternId(): number;
  /** Returns true if the section is patterned. Ie. at least one other section shares the same pattern id.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aba67a71b4dc81b0c4edf7fa861e86428 */
  isPatterned(): boolean;
  /** Returns the channel ID. Sections with the same channel ID belongs to the same channel.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a83697cde26a3ac55a6dff0ebb298d190 */
  getChannel(): number;
  /** Returns true if the section is optional.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a89a844f3504bfaeac21b2c9bf94440cb */
  isOptional(): boolean;
  /** Returns the feed mode. For multi-axis operations it will return the feedrate mode as defined in the machine configuration for multi-axis feedrates if TCP is not enabled. If TCP is enabled, then FEED_PER_MINUTE will be returned for multi-axis operations. The available modes are:
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aaaca651ac551530c84342d497074495f */
  getFeedMode(): number;
  /** Returns the turning tool orientation (radians).
   * @see https://cam.autodesk.com/posts/reference/classSection.html#add0af558e786748af999946edc3f922d */
  getToolOrientation(): number;
  /** Returns true if the section has a well-defined position. Sections with no position would cause getInitialPosition() and getFinalPosition() to fail.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a5caa2004b23d2b053944292d8e060d85 */
  hasWellDefinedPosition(): boolean;
  /** Returns the strategy of the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ae92731845001a6aa7d81a89b50ad0845 */
  getStrategy(): string | undefined;
  /** Returns machining type of the section The available types are:
   * @see https://cam.autodesk.com/posts/reference/classSection.html#abd227956a0f910a90fad3a5a28fdb9d4 */
  getMachiningType(): number;
  /** Returns the global position for the specified local position.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aa4bb627bff88fbd63240de4c4f22260d */
  getGlobalPosition(p: Vector): Vector;
  /** Returns the WCS position for the specified local position.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ad766e32a70e707566cbc6c2f434223cd */
  getWCSPosition(p: Vector): Vector;
  /** Returns true if the toolpath belongs to one or several specific strategy groups. The function can take more than one flag as argurments. e.g.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#adfd1e639d47e4d207818995892ceade2 */
  checkGroup(groups: number): boolean;
  /** Returns true if the work plane is set to the top plane (i.e. looking down the Z-axis) in the WCS. This method has been deprecated. See isZOriented() instead.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a83a74c6d58b2f80d2e1f741098025570 */
  isTopWorkPlane(): boolean;
  /** Returns true if the work plane is oriented such that forward is along the +X in the WCS. The same as checking "currentSection.workPlane.forward.x >= (1 - EPSILON)".
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a35533c376ac99d2f15dbd1a39c72586f */
  isXOriented(): boolean;
  /** Returns true if the work plane is oriented such that forward is along the +Y in the WCS. The same as checking "currentSection.workPlane.forward.y >= (1 - EPSILON)".
   * @see https://cam.autodesk.com/posts/reference/classSection.html#af4e4421ca393ac2a2652df1b3c17e00c */
  isYOriented(): boolean;
  /** Returns true if the work plane is oriented such that forward is along the +Z in the WCS. The same as checking "currentSection.workPlane.forward.z >= (1 - EPSILON)".
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a97b0ac457c72b19c9b3043fb0c0417b4 */
  isZOriented(): boolean;
  /** Returns the work origin in the global coordinate system (top view).
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a15a8262c75c216c7388afea288bf0e9e */
  getGlobalWorkOrigin(): Vector;
  /** Returns the work plane in the global coordinate system (top view).
   * @see https://cam.autodesk.com/posts/reference/classSection.html#accd6f33bac132d00f5b1d4806971cd56 */
  getGlobalWorkPlane(): Matrix;
  /** Returns the origin of the fixture coordinate system (FCS).
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a2f49018a28c7670ee4bd2a1477b9708d */
  getFCSOrigin(): Vector;
  /** Returns the fixture coordinate system (FCS) plane.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a28b3cd1d1c15472a3e3dac219329b138 */
  getFCSPlane(): Matrix;
  /** Returns true if the dynamic work offset is defined.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ad0241f0b9010172a226444587a21ff77 */
  hasDynamicWorkOffset(): boolean;
  /** Returns the dynamic work offset for the WCS. The dynamic work offset is used to control the display coordinates.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a8935067c052cec4c54d381cfad3ec986 */
  getDynamicWorkOffset(): number;
  /** Optimizes the machine angles for 5-axis motion given the specified machine configuration. The directions for onRapid5D() and onLinear5D() are hereafter mapped to machine angles from the initial direction vector. The work plane and origin are mapped into the WCS plane and origin.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a3de52305f41eea02ca61d3afa5dca6ef */
  optimizeMachineAnglesByMachine(machine: MachineConfiguration, optimizeType: number): void;
  /** Returns true if the section has been optimized for a machine configuration.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ab663c7732102c71aa6118152075dad7d */
  isOptimizedForMachine(): boolean;
  /** Returns the upper machine angles for a multi-axis section. The section must have been optimized for the machine using optimizeMachineAngles() or similar before called this method.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a51ee3130b9914b8f49bd7100593b0b17 */
  getLowerToolAxisABC(): Vector;
  /** Returns the upper machine angles for a multi-axis section. The section must have been optimized for the machine using optimizeMachineAngles() or similar before called this method.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a8a172236307627cbea6d536574619687 */
  getUpperToolAxisABC(): Vector;
  /** Returns true if the given cycle is the last effective move within the section. E.g. if onLinear() would be called after onCycle() this method will return false. onParameter() and onComment() are ignored.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a68862bfac858752b3c4ad6a2ea2248d2 */
  doesEndWithCycle(&_uri: string): boolean;
  /** Returns true if the given cycle is the first effective move within the section ignoring positioning moves (ie. rapid and high feed moves). E.g. if onLinear() would be called before onCycle() this method will return false. onParameter(), onComment() and onDwell() are ignored.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ab9bc2b0452a342c0ece42880641f86b2 */
  doesEndWithCycleIgnoringPositioning(uri: string): boolean;
  /** Returns true if the given cycle is the first effective move within the section. E.g. if onLinear() would be called before onCycle() this method will return false. onParameter() and onComment() are ignored.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ab68194b77002ec63f0a61691ac7460af */
  doesStartWithCycle(uri: string): boolean;
  /** Returns true if the given cycle is the first effective move within the section ignoring positioning moves (ie. rapid and high feed moves). E.g. if onLinear() would be called before onCycle() this method will return false. onParameter(), onComment() and onDwell() are ignored.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a15ec128ac4d52f73a7705511c6509a92 */
  doesStartWithCycleIgnoringPositioning(uri: string): boolean;
  /** Returns true if the given cycle is the only effective move within the section. onParameter() and onComment() are ignored.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ad80e4c1f00d881cc46bac0fae9392b64 */
  doesStrictCycle(uri: string): boolean;
  /** Returns 'true' if the section's toolpath fits within the linear axis limits of the machine.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a5397df9fcb492233c08b7a6ad9dec861 */
  doesToolpathFitWithinLimits(machine: MachineConfiguration, current: Vector): boolean;
  /** Returns the preferred ABC angles for the specified orientation such that the forward and optionally right directions are maintained. The preferences are defined in the 'controllingAxis', 'control', and 'options' parameters.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a237ae3909e66439720979c2fbebe4354 */
  getABCByPreference(machine: MachineConfiguration, orientation: Matrix, current: Vector, controllingAxis: number, type: number, options: number): Vector;
  /** Returns true if the section uses axis substitution. In axis substitution mode the coordinates are the following meaning: X: The offset along the substitution axis. Y: The rotation angle in radians. Z: Radius (always positive)
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aae12d24d4da1792f40b195c2b7eb6c6f */
  getAxisSubstitution(): boolean;
  /** Returns the nominal axis substitution radius.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a65985c265d1237a38d6ff034f8cfda20 */
  getAxisSubstitutionRadius(): number;
  /** Returns the ID of the given cycle within the section. Raises exception if index exceeds limit returned by Section.getNumberOfCycles().
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aad3c1231b852e965300e230cf4445baa */
  getCycleId(index: number): string;
  /** Returns the value of the first occurrence of the specified parameter within the given cycle.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ac282baa7c6516a8ef574cf9524d16be6 */
  getCycleParameter(index: number, name: string): any;
  /** Returns the dynamic origin of the WCS. Only use if the dynamic work offset is set.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a33b79512b06bb576dc998f9e17264504 */
  getDynamicWCSOrigin(): Vector;
  /** Returns the dynamic WCS plane. Only use if the dynamic work offset is set.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a9be7b615c08b2178befdf1b6442357fc */
  getDynamicWCSPlane(): Matrix;
  /** Returns true if the spindle speed is on at the end of the section. Might be turned off due to final canned cycle.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a108a97c096ec8712da22eb82a39ff4e4 */
  getFinalSpindleOn(): boolean;
  /** Returns the final spindle speed which can be different from the tool spindle speed. Might be turned off due to final canned cycle.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ac98dda6aa055302b67385f48ff09ff7f */
  getFinalSpindleSpeed(): number;
  /** Returns the first active compensation for the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a2a736c070beb7cb37a92e726267add8c */
  getFirstCompensationOffset(): number;
  /** Returns the first cycle within the section. Returns empty string is no cycle occurs within the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a0ccc9439dbb8557fe67ea3ee979c42d4 */
  getFirstCycle(): string;
  /** Returns the final tool axis for the section in the WCS frame. Always returns the direction vector.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aaf495f9411c47fdaeba1d22be535c7ac */
  getGlobalFinalToolAxis(): Vector;
  /** Returns the range of the toolpath of the section along the global direction.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a8ccb50eb1b439e63ddb5fe1c70f36352 */
  getGlobalRange(direction: Vector): Range;
  /** Returns the type of waterjet, laser, and plasma cutting of the section. The available modes are:
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a69d8ca2ac5d957016ff40014e8cbfa7b */
  getJetMode(): number;
  /** Returns the last cycle within the section. Returns empty string is no cycle occurs within the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#aa62ddf5ead4931c33cd03d1e31d1b23a */
  getLastCycle(): string;
  /** Returns the origin of the Model coordinate system.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a8a22f74bee6d22d29277af8a2426d9e9 */
  getModelOrigin(): Vector;
  /** Returns the Model coordinate system plane.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ac78361254e3f71ca66da1207daab6d22 */
  getModelPlane(): Matrix;
  /** Returns the number of times the given cycle occurs within the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#afe2f91d128de5530a99defa6a9021eee */
  getNumberOfCyclesWithId(uri: string): number;
  /** Returns the number of pattern instances for the section.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a73b4a661542042cab95b2ddc5e3a54a3 */
  getNumberOfPatternInstances(): number;
  /** Returns the operation property map.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a63053790bd6ce77b62e2bef6f98788bf */
  getOperationProperties(): number;
  /** Returns the bounding box of the toolpath of the section in the coordinate system optimized for the rotary axes.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ab101df94e51f2cf2ae0dfdbd663be8f2 */
  getOptimizedBoundingBox(machine: MachineConfiguration, abc: Vector): BoundingBox;
  /** Returns the TCP mode used for the section when it was optimized for a machine configuration.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a5119a6a47cd6013fad8bb3d4ce3e6333 */
  getOptimizedTCPMode(): number;
  /** Returns the part attach point in the world coordinate system. The return position is undefined if the machine configuration does not use a machine simulation model.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a3110362aaee22d04aa8627bf05c85260 */
  getPartAttachPoint(): Vector;
  /** Returns true if part catcher should be activated if available for turning.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a71f37b7ea7373c07305c1df892a78967 */
  getPartCatcher(): boolean;
  /** Returns user-specified direction for polar machining type
   * @see https://cam.autodesk.com/posts/reference/classSection.html#afbf23619ad81be01f1cd7addec7d347a */
  getPolarDirection(): Vector;
  /** Returns polar mode type The available types are:
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ab9dcaa2a784f94d96534f75444fb4859 */
  getPolarMode(): number;
  /** Returns the work offset for the WCS.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ac1c45504b9ed02d9ecf6bd025481f18a */
  getProbeWorkOffset(): number;
  /** Returns the associated quality. Used for waterjet, laser, and plasma cutting.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a3039104f82f0d5850d650c33406f256e */
  getQuality(): number;
  /** Returns the local position for the specified global position.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a606a396c0ce2fe1381b20933618deb97 */
  getSectionPosition(p: Vector): Vector;
  /** Returns the active spindle. The available values are:
   * @see https://cam.autodesk.com/posts/reference/classSection.html#ad617d43d6570d99425b260174e12332d */
  getSpindle(): number;
  /** Returns true if tailstock is active for turning.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a5cbd2b1f929e71b795673749f31e2ac0 */
  getTailstock(): boolean;
  /** Retuns the mode for using rotations to fit toolpath within limits. Possible return values:
   * @see https://cam.autodesk.com/posts/reference/classSection.html#abefaaac90d3aecc3639eb4580ce27856 */
  getUseRotationsToFitLimits(): number;
  /** Returns true if the specified parameter has been defined in the given cycle.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a29257148cd711b846edb65950a653a92 */
  hasCycleParameter(index: number, name: string): boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a9c3378f7ea8c1987132812ae86beed70 */
  isConnectionSection(): boolean;
  /** Returns true if the milling motion for the section is further away from X0 Y0 than the given distance. Can be used to check if motion gets close to the rotary axis for XZC milling. Returns false for non-milling toolpath.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#add197e755e9fb3189303fce511094f4f */
  isCuttingMotionAwayFromRotary(distance: number, tolerance: number): boolean;
  /** Returns true, if rapid polar links should be used, false - for linear rapid links, undefined - if not specified (Fusion assumes they are linear)
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a50c3c03248cb82fb70e4d42aef36cc05 */
  isPolarRapidLinks(): boolean;
  /** Adjusts the tool end points for the rotary axes positions in 3+2 operations for the active machine configuration. The directions for onRapid(), onLinear(), onCyclePoint(), and onCircular() are hereafter mapped according to the input rotary axis angles.
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a75cfd9afccf9d5fc863f9939a1db99bc */
  optimize3DPositionsByMachine(machine: MachineConfiguration, abc: Vector, optimizeType: number): void;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#af3b5965c595505b82f13f58114b3b922 */
  polarMode: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classSection.html#a5feb01508ae001d9bdb8ac76f76080df */
  polarRapidLinks: boolean;
}

// ---------------------------------------------------------------------------
//  Record
// ---------------------------------------------------------------------------

/** A single NC record. */
declare class Record {
  /** Returns the type of the record.
   * @see https://cam.autodesk.com/posts/reference/classRecord.html#a367706e675179342e6153c45f1ba06ae */
  getType(): number;
  /** Returns true if a named parameter is available. */
  hasParameter(name: string): boolean;
  /** Returns the parameter value. */
  getParameter(name: string): any;
  /** Returns true if the record is a motion record.
   * @see https://cam.autodesk.com/posts/reference/classRecord.html#ad65df31f72a57487901d062c41314b61 */
  isMotion(): boolean;
  /** Returns true if the record is a parameter.
   * @see https://cam.autodesk.com/posts/reference/classRecord.html#af3b1bf03a6f19905cfc6e84f22c772c8 */
  isParameter(): boolean;
  /** Returns the categories.
   * @see https://cam.autodesk.com/posts/reference/classRecord.html#a0ad9a5ed5f4cc7ef4d6f69d58b2ee9c7 */
  getCategories(): number;
  /** Returns the cycle type.
   * @see https://cam.autodesk.com/posts/reference/classRecord.html#a2f10932cb4ba711e4c08e8b29708942e */
  getCycleType(): string;
  /** Returns the id of the record.
   * @see https://cam.autodesk.com/posts/reference/classRecord.html#a929e1325a515b279faca90a65028782e */
  getId(): number;
  /** Returns the parameter name.
   * @see https://cam.autodesk.com/posts/reference/classRecord.html#a9e23a4185f88352fe28946adde324203 */
  getParameterName(): string;
  /** Returns the parameter value.
   * @see https://cam.autodesk.com/posts/reference/classRecord.html#ad23d02823736f4afad9ef84bb805927c */
  getParameterValue(): any;
  /** Returns true if the record is a cycle record.
   * @see https://cam.autodesk.com/posts/reference/classRecord.html#a7eee12e78f42ddedd678db5941dfcb35 */
  isCycle(): boolean;
  /** Returns true if the record is valid.
   * @see https://cam.autodesk.com/posts/reference/classRecord.html#a8c76e436eacd7856afe5175839e03ff0 */
  isValid(): boolean;
  /** Constructs an invalid record.
   * @see https://cam.autodesk.com/posts/reference/classRecord.html#a07276bea648b636cea93f5da057d575b */
  Record(): void;
}

// ---------------------------------------------------------------------------
//  MachineConfiguration
// ---------------------------------------------------------------------------

/** Machine configuration describing the kinematic chain.
 * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html */
declare class MachineConfiguration {
  /** Returns the total number of axes.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ad7ffb12bd1cee8d775d92489ddb38e4f */
  getNumberOfAxes(): number;
  /** Returns the rotary axis bound to the specified coordinate.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#af99d1fda24f32211276de7d620163890 */
  getAxisByCoordinate(coordinate: number): Axis;
  /** Returns true if the configuration is a multi-axis configuration (i.e. if any of the U, V, or W axes are defined).
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a3f29d926f2a49fe4c6f2de6dbc757570 */
  isMultiAxisConfiguration(): boolean;
  /** Returns true if the configuration is a head configuration (i.e. if any axis excluding X, Y, and Z is a head axis).
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a44007b94d350212c17e13b119e8ea9f6 */
  isHeadConfiguration(): boolean;
  /** Returns true if the configuration is a table configuration (i.e. if all axes excluding X, Y, and Z are in the table).
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a1246e817208f8be1520b44b65aeb0582 */
  isTableConfiguration(): boolean;
  /** Returns the ABC angles for the specified orientation such that the forward direction is maintained. An extra Z rotation in the local frame is normally required to achieve the desired orientation.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a3b04e5033501c7570f3805400cad7da3 */
  getABC(orientation: Matrix): Vector;
  /** Returns the preferred ABC angles for the specified ABC angles.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aea98587d27105d3548139b66d97df7ae */
  getPreferredABC(abc: Vector): Vector;
  /** Maps the specified angles to the preferred ranges. An exception is raised if a requested rotation is not supported for an axis.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a11c2beff187a49d410fcf5cae082c9bb */
  remapABC(abc: Vector): Vector;
  /** Returns the machine retraction plane coordinate.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a5c0a8484b9594b91ea785b64983f59c8 */
  getRetractPlane(): number;
  /** Sets the machine retraction plane coordinate.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a5aed5e43b2d92129c9bd89d3b79f8cfe */
  setRetractPlane(value: number): void;
  /** Returns true if a retract plane is defined. */
  hasRetractPlane(): boolean;
  /** Returns the X-coordinate home position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a4d5d0e6700b3e8d3dfbc428bde65196f */
  getHomePositionX(): number;
  getHomePositionY(): number;
  getHomePositionZ(): number;
  /** Sets the model.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#af82ae8b4d0abd561b4e12c920c989f29 */
  setModel(model: string): void;
  /** Sets the description.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a083ef0e7a3bf10eaa38e081d0bb3c731 */
  setDescription(description: string): void;
  /** Sets the vendor.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#acbe484e624c68331dd7ddd01aea721a3 */
  setVendor(vendor: string): void;
  /** Sets the number of axes. */
  setNumberOfAxes(n: number): void;
  /** Returns the spindle axis without machine rotations.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a9b5a654333b1eb369edf3cb9637a6064 */
  getSpindleAxis(): Vector;
  /** Sets the spindle axis without machine rotations. The default is (0, 0, 1).
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a1c3853cf0dabe2cbde505b8de811c2ea */
  setSpindleAxis(axis: Vector): void;
  /** Adds the specified axis.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a0525be1715adc90620f2ba026de30c8c */
  addAxis(axis: Axis): void;
  /** Returns the clamped ABC angles. Disabled coordinates are set to 0.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a54ccda13b5e85e64ed813c098db01689 */
  clamp(_abc: Vector): Vector;
  /** Returns the clamped ABC angles. Disabled coordinates are set to 0.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a2bb73181432fa0d2a0bf9144f3040b7d */
  clampToResolution(_abc: Vector): Vector;
  /** Loads the machine configuration from the specified path.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a68f5e15b5525a45485b420d01724f124 */
  createFromPath(path: string): MachineConfiguration;
  /** Loads the machine configuration from the specified XML.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a896731506787b957da661809bb14b411 */
  createFromXML(xml: string): MachineConfiguration;
  /** Disables machine rewinds.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a5a064d4d54f6692b37acfd44e6d4ff53 */
  disableMachineRewinds(): void;
  /** Enables machine rewinds.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ad41fd6f03e4ac634a0a2aeba8641605a */
  enableMachineRewinds(): void;
  /** Returns the ABC angles for the specified direction. The solution with the least tilt is returned.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a9e4348d88f8245df1be0828d67f17678 */
  getABCByDirection(direction: Vector): Vector;
  /** Returns the secondary ABC angles for the specified direction. Returns the primary solution if the secondary solution does not exist.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aaa7bfb04809491485d99dff804fcdc71 */
  getABCByDirection2(direction: Vector): Vector;
  /** Returns the ABC angles for both solutions for the specified direction. Both solutions will be identical when only one solution exists. The first solution is the one with the least tilt.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a7bd25be1d79266f0d488740a7c66a557 */
  getABCByDirectionBoth(direction: Vector): VectorPair;
  /** Returns the preferred ABC angles for the specified orientation such that the forward and optionally right directions are maintained. The preferences are defined in the 'controllingAxis', 'control', and 'options' parameters. Behaves the same as section.getABCByDirection, but does not support the ENABLE_LIMITS flag.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a14bcc7550639c482492b4ad05b1580c8 */
  getABCByPreference(orientation: Matrix, current: Vector, controllingAxis: number, type: number, options: number): Vector;
  /** Returns true if additive fff is supported.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a5282b5fe64a57682f8c0d9bf935ddddd */
  getAdditiveFFF(): boolean;
  /** Returns the angle in the radians.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a7b57f39fd91d40fd01911067b69ea43a */
  getAsAngular(text: string): number;
  /** Returns the angular feed in rad/min.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a55ba9a3ed2083bcab3a7e5e015b2f203 */
  getAsAngularFeedrate(text: string): number;
  /** Returns the power in W (Watt).
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a5c579fb61cecb51df9acc32c8fea45c3 */
  getAsPower(text: string): number;
  /** Returns the spatial text in the current unit.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ad44484ab4443148b94a04ae15eb21ede */
  getAsSpatial(text: string): number;
  /** Returns the spatial text in the current unit.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a592dda31eafb2d08b7fc09c22de5a04c */
  getAsSpatialFeedrate(text: string): number;
  /** Returns the time in the seconds.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ad05c52cb3fea0e32de09b017a9e22b81 */
  getAsTime(text: string): number;
  /** Returns the weight in kg.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#af843e3662063785c93a2e565a308d9a7 */
  getAsWeight(text: string): number;
  /** Returns the axis by name.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a55dda7fd7cce98290dc53c323f9652fc */
  getAxisByName(name: string): Axis;
  /** Returns the U axis.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#acb791b9841ac151674fa6f5f304fd049 */
  getAxisU(): Axis;
  /** Returns the V axis.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a24b64554b81dbe691cb4550c482aaa43 */
  getAxisV(): Axis;
  /** Returns the W axis.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a9b0affe8e06311628ccbaced2911c9e6 */
  getAxisW(): Axis;
  /** Returns the X axis.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#acb88ee22c97100f10835ad3486b21cf1 */
  getAxisX(): Axis;
  /** Returns the Y axis.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a308c2a6ea8eff5efd7e3609f6f81e59c */
  getAxisY(): Axis;
  /** Returns the Z axis.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aa4d00aa637ae48208acc62febc0ef484 */
  getAxisZ(): Axis;
  /** Returns the X-coordinate center position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a09a722fcaf59589d87c9a1b3311f1ec6 */
  getCenterPositionX(): number;
  /** Returns the Y-coordinate center position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aaf277c0aff422827fda9edaef9cf9a06 */
  getCenterPositionY(): number;
  /** Returns the Z-coordinate center position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a0a4c82fed9c3f4f36911b516cfd81658 */
  getCenterPositionZ(): number;
  /** Returns the current angles closest to the new machine angles. (hidden)
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a6575a2debfdec02a5fdf56406e8f738b */
  getClosestABC(current: Vector, abc: Vector): Vector;
  /** Returns the collect chuck. Tool-holder interface.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a33c85e4e37ca049a9638cc3fa4511c2d */
  getCollectChuck(): string;
  /** Returns the control.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aeafa8d8cfb37035f112c0f997aaf509c */
  getControl(): string;
  /** Returns the bits indicating the machine angle coordinates in use. Bit 0: coordinate 0 is used. Bit 1: coordinate 1 is used. Bit 2: coordinate 2 is used.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a8d2fac94e6c1df8cb2b7a4bb18ee8c80 */
  getCoordinates(): number;
  /** Returns the width of the machine.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#af60b5ab8068ba175c76770d6d3931e8b */
  getDepth(): number;
  /** Returns the description.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ac7feffb7a33f63504ff1f87f19e2d2d8 */
  getDescription(): string;
  /** Returns the dimensions of the machine as (width, depth, height).
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a0ea976a96593f6fbc58f5a71f43c48d7 */
  getDimensions(): Vector;
  /** Returns the direction for the specified ABC angles.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a53f726348c9d368f037bafb20aa39c74 */
  getDirection(abc: Vector): Vector;
  /** Returns the extruder offset X-coordinate.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a0a94fdde7e990bcc2632947bee475c18 */
  getExtruderOffsetX(extruderNo: number): number;
  /** Returns the extruder offset Y-coordinate.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a7641e286f5928a330769f5ab42b6804e */
  getExtruderOffsetY(extruderNo: number): number;
  /** Returns the extruder offset Z-coordinate.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a67bb72753eaaa6232e1f40d3e90d4f98 */
  getExtruderOffsetZ(extruderNo: number): number;
  /** Returns the feedrate ratio.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aa17b1e583bc574fc710d938ba63e2259 */
  getFeedrateRatio(): number;
  /** Returns the head ABC angles for the specified ABC angles. Ie. non-head axes are set to zero.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a1d2f326d8a15eae5539778fc47c5cffb */
  getHeadABC(abc: Vector): Vector;
  /** Returns the machine head attach point in machine system coordinates.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a7c41cd252472ff26e95833f438626a30 */
  getHeadAttachPoint(): Vector;
  /** Returns the head orientation for the specified ABC angles.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a9afc7e8e5c52e728b7cce2e523323d84 */
  getHeadOrientation(abc: Vector): Matrix;
  /** Returns the width of the machine.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a33f99e92099bd34eb76bc7ba0e5d546f */
  getHeight(): number;
  /** Returns the order of the given axis. Returns -1 if not found.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a34a78203a21307bf3431497e42292fbb */
  getIndexOfAxisById(id: AxisId): number;
  /** Returns true if inspection is supported.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a4f8d538216d2f96c3f926db5ff63ed2e */
  getInspection(): boolean;
  /** Returns true if jet is supported (waterjet, laser cutter, and plasma cutter).
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ae684e45e75e936e415759920345dd0ef */
  getJet(): boolean;
  /** Returns the maximum block processing speed.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a76f013fe87fdbb659db063d371332215 */
  getMaximumBlockProcessingSpeed(): number;
  /** Returns the maximum cutting feedrate.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a1e55ccb62b45ebfa08ee1e7f6d867fd0 */
  getMaximumCuttingFeedrate(): number;
  /** Returns the maximum feedrate.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a85d50cd78571d385825d6d79cfd82825 */
  getMaximumFeedrate(): number;
  /** Returns the maximum spindle power defined in kW or hp.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a0f0389121dc8789a7a18ddbd9f069ff7 */
  getMaximumSpindlePower(): number;
  /** Returns the maximum spindle speed.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#abaee13713dded943cecf1fd20d89cea1 */
  getMaximumSpindleSpeed(): number;
  /** Returns the maximum tool diameter.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a7c7e3579f14514c0beecfa7638a36bda */
  getMaximumToolDiameter(): number;
  /** Returns the maximum tool length.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a8b9f4f58c4c79fbc1b2ba4926c254e3b */
  getMaximumToolLength(): number;
  /** Returns the maximum tool weight.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ad74abbdd14469a262af0df0c932950b3 */
  getMaximumToolWeight(): number;
  /** Returns true if milling is supported.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a66ba1fe1fe92acd6f1011a44ae11eddf */
  getMilling(): boolean;
  /** Returns the minimum spindle speed.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a3c01f2fbdb1992320029835100c20bea */
  getMinimumSpindleSpeed(): number;
  /** Returns the model.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a72ed58521c1ebcb21c643e00ff242f72 */
  getModel(): string;
  /** Returns the multi-axis feed rate bpw ratio. Raises an exception of the feed mode is not FEED_DEGREES_MINUTE. See setMultiAxisFeedrate() for description.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a272ef68157cf9a567102d9332603d1ae */
  getMultiAxisFeedrateBpwRatio(): number;
  /** Returns the multi-axis feedrate DPM sub-type. Returns either DPM_STANDARD or DPM_COMBINATION. Raises an exception of the feedrate mode is not FEED_DEGREES_MINUTE. See setMultiAxisFeedrate() for description.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a046accff619ce2067553b1e73d0bcaf9 */
  getMultiAxisFeedrateDPMType(): number;
  /** Returns the multi-axis feedrate time units. Returns either NVERSE_SECONDS or INVERSE_MINUTES. Raises an exception of the feedrate mode is not FEED_INVERSE_TIME. See setMultiAxisFeedrate() for description.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ac33fb180dc81456b0e3289bca914bc93 */
  getMultiAxisFeedrateInverseTimeUnits(): number;
  /** Returns the multi-axis maximum feed rate. See setMultiAxisFeedrate() for description.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a4bbfc852d252a002ae8e021bb3063da5 */
  getMultiAxisFeedrateMaximum(): number;
  /** Returns the multi-axis feed mode. Returns FEED_INVERSE_TIME, FEED_DEGREES_MINUTE or FEED_PER_MINUTE. See setMultiAxisFeedrate() for description.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#abe877428fa92f437906522aaec6eecf6 */
  getMultiAxisFeedrateMode(): number;
  /** Returns the multi-axis feed rate output tolerance. Raises an exception of the feed mode is not FEED_DEGREES_MINUTE. See setMultiAxisFeedrate() for description.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#af99847e8daae33dcd556d52592f71fcd */
  getMultiAxisFeedrateOutputTolerance(): number;
  /** Returns the number of extruders.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a4439aea0c6dab3fbe1d76aa400a07008 */
  getNumberExtruders(): number;
  /** Returns the maximum number of tools.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a8a9570e12ba2ece65269f5b9c8828ed3 */
  getNumberOfTools(): number;
  /** Returns the number of work offsets.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a9fb92125d0e145ffc988d46f9451d0fa */
  getNumberOfWorkOffsets(): number;
  /** Adjusts a vector for the rotary table rotations.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a99ae29405b8bf972510400adaa4c7929 */
  getOptimizedDirection(direction: Vector, currentABC: Vector, reverse: boolean, forceAdjustment: boolean): Vector;
  /** Adjust the tool position for the rotary head rotations.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ade4610092aba42e1320893372b249d0a */
  getOptimizedHeads(currentXYZ: Vector, currentABC: Vector, reverse: boolean, optimizeType: number, forceAdjustment: boolean, pivotPoint: boolean): Vector;
  /** Adjusts the tool position for the rotary table and head rotations based on the defined kinematics of the machine. You can obtain the adjusted coordinates of the tool position based on the optimization of the specified section instead by using the following command. section.getOptimzedPosition(...)
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a01ea795d284397cecd89937801889445 */
  getOptimizedPosition(currentXYZ: Vector, currentABC: Vector, tcpType: number, optimizeType: number, forceAdjustment: boolean): Vector;
  /** Adjust the tool position or tool vector for the rotary table rotations. Uses the same arguments as 'getOptimizedPosition' with the addition of 'isVector', when enabled states that 'currentXYZ' is a vector and not an XYZ coordinate.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a40f26ea730555b06d3825514504b0ab8 */
  getOptimizedTables(currentXYZ: Vector, currentABC: Vector, reverse: boolean, optimizeType: number, isVector: boolean, forceAdjustment: boolean): Vector;
  /** Returns the matrix for the specified ABC angles. Returns an identity matrix along the spindle vector.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#af6e77a5eebd4b6b10c8924b19f9b0c89 */
  getOrientation(abc: Vector): Matrix;
  /** Returns the matrix for the specified ABC angles.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a1be4fe59bf84da4d59007744644132e9 */
  getOrientationABC(abc: Vector): Matrix;
  /** Returns the other ABC angles for the specified ABC angles. You should normally use getABCByDirection2() to get the secondary solution directly. For up to 4 axis machines the return value is always the input ABC angles. The result is undefined if given invalid ABC angles.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#abcabf25b9039a6addb48782f313d9c56 */
  getOtherABCByDirection(abc: Vector): Vector;
  /** Returns the X-coordinate park position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a8154db5bd88728a3c7ae04e302319a00 */
  getParkPositionX(): number;
  /** Returns the Y-coordinate park position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aa7b4f9ce079c706c6ff4be2e615051e2 */
  getParkPositionY(): number;
  /** Returns the Z-coordinate park position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a0826b6182eb28b3f1b0b7516b5d94c7f */
  getParkPositionZ(): number;
  /** Returns the maximum allowed part dimensions.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aabc7a344f08d4a4c7602d415ef7c1848 */
  getPartDimensions(): Vector;
  /** Returns the width of the machine.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a9035e9936e541004b9ba892720fe000d */
  getPartMaximumX(): number;
  /** Returns the width of the machine.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a938c5e9cd87993688c06d2cc24e112bc */
  getPartMaximumY(): number;
  /** Returns the width of the machine.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a86de99384044ddd059e538fc928ab53a */
  getPartMaximumZ(): number;
  /** Returns the position for the specified absolute position and direction. Use getOptimizedPosition() instead to get the rotary axis adjusted position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#afd9a0d557b8a7417937bd868ea1a9812 */
  getPosition(p: Vector, abc: Vector): Vector;
  /** Returns whether machine config allows retract and reconfigure.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a05dfa27dab0e1b3f92bd67c4566bccc1 */
  getReconfigure(): boolean;
  /** Returns the additional rotation required to reach the specified work orientation. For valid machine rotations this will always be a rotation around the Z.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a87186ca6f09e5fd79639b20997bfe504 */
  getRemainingOrientation(abc: Vector, desired: Matrix): Matrix;
  /** Returns the additional rotation required to reach the specified work orientation. For valid machine rotations this will always be a rotation around the Z. Use this function when the spindle vector can change due to the rotary axis position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ad1268eda9ea1ccc860ce8c23e1a443d7 */
  getRemainingOrientationABC(abc: Vector, desired: Matrix): Matrix;
  /** Returns the retract on indexing mode.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ab0715c2d4689a824e383cf956494cf27 */
  getRetractOnIndexing(): boolean;
  /** Returns the stock expansion values used for retracts and rewinds.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#abdc99d4b51b28b35b8724e1b4e5d74e3 */
  getRewindStockExpansion(): Vector;
  /** Returns the rewind strategy (AXIS_PREFERENCE or MINIMIZE_REWINDS).
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a381d8c8541b8f821d00646b0e477dd40 */
  getRewindStrategy(): number;
  /** Return rotation axis adjusted for carrier rotations. (hidden)
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ae1326787c8498262fa88b92bdd7986d3 */
  getRotationAxis(axis: Axis): Vector;
  /** Returns the safe feedrate value used for plunge moves in rewinds.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a4704d30452e181dc6a54e9b74d016c47 */
  getSafePlungeFeedrate(): number;
  /** Returns the safe distance value for retract moves in rewinds.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a9b504305540535973fd3a18b60b9d10c */
  getSafeRetractDistance(): number;
  /** Returns the safe feedrate value used for retract moves in rewinds.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a20137521dabac74d76dc4bf5b3dbefa4 */
  getSafeRetractFeedrate(): number;
  /** Returns shortest angular rotation mode.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#acd8b71ed96b956c861c442b624f7ad8b */
  getShortestAngularRotation(): boolean;
  /** Returns true if multi-axis singularity adjustment is enabled. See setSingularity() for description.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ad682c381743da300075053a45b71b586 */
  getSingularityAdjust(): boolean;
  /** Returns the multi-axis singularity angle. See setSingularity() for description. This parameter is in radians.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aed034f7b39ddeab3e5171c6ce228ec42 */
  getSingularityAngle(): number;
  /** Returns the multi-axis singularity cone. See setSingularity() for description. This parameter is in radians.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a8c69f24fc34271713ea87f01e60cf6c5 */
  getSingularityCone(): number;
  /** Returns the multi-axis singularity linearization tolerance. See setMultiAxisSingularity() for description.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ae582721823c1392683f412edd37fdd5f */
  getSingularityLinearizationTolerance(): number;
  /** Returns the multi-axis singularity method. See setSingularity() for description.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#adcd061ae377ce094d910c2fda352e339 */
  getSingularityMethod(): number;
  /** Returns the multi-axis singularity tolerance. See setSingularity() for description.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#af7af1b2c9922e454be4f1d69830999b4 */
  getSingularityTolerance(): number;
  /** Returns the spindle axis for the given ABC machine angles.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a9eafd89bf3b6787c4ec1b74f05b514ce */
  getSpindleAxisABC(abc: Vector): Vector;
  /** Returns the spindle description.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ab11de979c3fe2e74b4246f32bd4aba94 */
  getSpindleDescription(): string;
  /** Returns the spindle peak torque defined in Nm or ft-lb.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a76e837fe355a44ba7e05f376bb233cb6 */
  getSpindlePeakTorque(): number;
  /** Returns the spindle speed at which peak torque is reached defined in RPM.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a1e4d8de07679335a7d5a390cc2de8ca1 */
  getSpindlePeakTorqueSpeed(): number;
  /** Returns the description for the specified status code.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ae932b0c72dedd9073ffecc1549938e15 */
  getStatusDescription(status: number): string;
  /** Returns the table ABC angles for the specified ABC angles. Ie. non-table axes are set to zero.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a27d64a80d2d50e231c82adb46230b203 */
  getTableABC(abc: Vector): Vector;
  /** Returns the machine table attach point in machine system coordinates.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a8a1dc885a35f30578ea1277e5e62352b */
  getTableAttachPoint(): Vector;
  /** Returns the table orientation for the specified ABC angles.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a60d409b2ae438d302dea0bfcd3db1bf3 */
  getTableOrientation(abc: Vector): Matrix;
  /** Returns the X-coordinate tool change position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ae543408140243efc306fdba65e4e7958 */
  getToolChangePositionX(): number;
  /** Returns the Y-coordinate tool change position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#afc00bed59e64b1b4993916d7c7575366 */
  getToolChangePositionY(): number;
  /** Returns the Z-coordinate tool change position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a2ad304450dd7cc4fd327f7a6348497a4 */
  getToolChangePositionZ(): number;
  /** Returns true if an automatic tool changer is available.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a4815a982e0e6e397aeb32f20085112a9 */
  getToolChanger(): boolean;
  /** Returns the tool change time.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ae7f1da1098e7e3f3ecdfca67250947b5 */
  getToolChangeTime(): number;
  /** Returns the tool interface.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#afe80118fe7bf484a30fcbf500d15cc70 */
  getToolInterface(): string;
  /** Returns the tool length used for head coordinate adjustments.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a49e642520ec4d602e222e80499e4c641 */
  getToolLength(): number;
  /** Returns true if a tool preload is supported.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ab0430154d2b85595679c4582c724bf0f */
  getToolPreload(): boolean;
  /** Returns true if turning is supported.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#acd300e53269860c43038b5c2137aacea */
  getTurning(): boolean;
  /** Returns a validity status code for the machine configuration. Use getStatusDescription() to convert the status code to an error message. The following must be true for a configuration to be valid: Returns 0 is returned for valid configurations.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a5baf89331073edebe28417958141ce55 */
  getValidityStatus(): number;
  /** Returns the vendor.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a302cede76897f855726f58e5778ddc17 */
  getVendor(): string;
  /** Returns the vendor url.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ae09709e93a40fb4122e475a0eb6b2a39 */
  getVendorUrl(): string;
  /** Returns the virtual tool end positioning setting.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a7918baab261ac5062115bb1beb00f7be */
  getVirtualTooltip(): boolean;
  /** Returns the weight of the machine.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ae91aa87b0cb450c83ba464a7adf3789f */
  getWeight(): number;
  /** Returns the weight capacity.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a160e2661069211e601682ac4e642b4c4 */
  getWeightCapacity(): number;
  /** Returns the width of the machine.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#abeecfc0ba733aabc65d9174b71c17e68 */
  getWidth(): number;
  /** Returns true if wire is supported.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#abbc6d85a86065811680b3de81413b41d */
  getWire(): boolean;
  /** Returns the XML representation of the machine configuration.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a09a91b04df0d5f8fa531a773f03b5e08 */
  getXML(): string;
  /** Returns true if the machine has a valid center position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aa7f0281373f57ba92d9d0c468a40a8d1 */
  hasCenterPosition(): boolean;
  /** Returns true if the X-coordinate of the home position is valid.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a4ae8fcc85e6ad75db189c504e05a99f6 */
  hasHomePositionX(): boolean;
  /** Returns true if the Y-coordinate of the home position is valid.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a35c67de068ffca03aa9ee7060d8848c7 */
  hasHomePositionY(): boolean;
  /** Returns true if the Z-coordinate of the home position is valid.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ad9f7362a3f59d267071c093aa29cdf3d */
  hasHomePositionZ(): boolean;
  /** Returns true if the machine has a valid park position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a60609b1b25f6bc8f5f003f00c9f707a8 */
  hasParkPosition(): boolean;
  /** Returns true if the X-coordinate of the tool change position is valid.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a06fe2fc150a79cdc8ed347124442843e */
  hasToolChangePositionX(): boolean;
  /** Returns true if the Y-coordinate of the tool change position is valid.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a43722475485361f9249c559c1af915a9 */
  hasToolChangePositionY(): boolean;
  /** Returns true if the Z-coordinate of the tool change position is valid.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a2bf326bb5255d3d2033f9ea8c2e32dcc */
  hasToolChangePositionZ(): boolean;
  /** Returns true if this is a 3D machine configuration (i.e. axis U, V, and W are undefined).
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aa04578811c6e29e69bc30f823b926482 */
  is3DConfiguration(): boolean;
  /** Returns true if the specified ABC angles are supported. Disabled coordinates are ignored.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a347ef795fc0d6689104dab82def32c1b */
  isABCSupported(_abc: Vector): boolean;
  /** Returns true if the coolant is supported.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a4e865a1f2edfb1e4e4401443463ca464 */
  isCoolantSupported(coolant: number): boolean;
  /** Returns true if the specified direction is supported by the machine configuration.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a98c27611db12b17789f62b1a5b7a7f80 */
  isDirectionSupported(direction: Vector): boolean;
  /** Returns true if the specified rotation A, B, and C rotates around the available machine axes only. That is, the rotation around a non-machine axis must be exactly 0.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ac2735b16ee48cca4eaefb9fd1bc39cef */
  isMachineAxisRotation(abc: Vector): boolean;
  /** Returns true if the specified coordinate is mapped to a machine rotary axis. By convention coordinate 0, 1, and 2 maps to A, B, and C, respectively.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a495d87f34a4ec2a342203a2043201605 */
  isMachineCoordinate(coordinate: number): boolean;
  /** Returns true if this MachineConfiguration was specified from the CAM system, or a machine file Returns false if the machine configuration was created by the post script.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#afec0257f9c3f47d37bd158776258f361 */
  isReceived(): boolean;
  /** Returns true if the configuration is valid. See getValidityStatus() for additional information.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ac46e4bc38d97d34e1c18ba449670287c */
  isSupported(): boolean;
  /** Returns true if the specified machine axis position is supported. That is, within any given ranges for the X, Y, and Z axes.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a397e557cbf4f3d230fc42f892e4d9319 */
  isSupportedPosition(position: Vector): boolean;
  /** Returns true if TCP is enabled for any rotary axis.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a766b8a0a99158ad283a16cbc22a6d15a */
  isTCPEnabledForAnyAxis(): boolean;
  /** Returns true if the specified XYZ position is supported. Disabled coordinates are ignored.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a17d728a6bd35582d739aa3cfc4d0032a */
  isXYZSupported(_xyz: Vector): boolean;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a42025f809d3941c06663bd44b1be6338 */
  MachineConfiguration(): void;
  /** Returns whether the machine should rewind when needed.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ab69fa948d382596d6f4ecce1ca0c3482 */
  performRewinds(): boolean;
  /** Keep secondary angle when tool axis is perpto rotary axis vector. (hidden)
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ac012140c7cb0a6730c17474017486841 */
  preserveRotaryAtZero(currentDirection: Vector, previousABC: Vector, currentABC: Vector): Vector;
  /** Maps the specified angles to the current machine angles. An exception is raised if a requested rotation is not supported for an axis. It is assumed that the desired angle difference is less than 180deg always.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a889982bbe5918c849bed80dc2a4b96c5 */
  remapToABC(abc: Vector, current: Vector): Vector;
  /** Sets if additive fff is supported.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aee73e26aa2e76383841e31cad21dcc59 */
  setAdditiveFFF(additive: boolean): void;
  /** Sets the X-coordinate center position. (hidden)
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aeef963588b20d3f684ae36c113fce1ba */
  setCenterPositionX(x: number): void;
  /** Sets the Y-coordinate center position. (hidden)
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a17a682df4c9293d54bbf423d597a4c2e */
  setCenterPositionY(y: number): void;
  /** Sets the Z-coordinate center position. (hidden)
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ae10e397198f350c12b708caff90cc317 */
  setCenterPositionZ(z: number): void;
  /** Sets the collect chuck. Tool-holder interface.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a6b5dd01994af061c98550625ac12d6e2 */
  setCollectChuck(collectChuck: string): void;
  /** Sets the control.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a42d118598f667178db8f1e970a25a965 */
  setControl(control: string): void;
  /** Sets if the coolant is supported. Maximum limit is 256. COOLANT_OFF is not allowed.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#af85fe887cf24e0b8e5575ea60b9295fb */
  setCoolantSupported(coolant: number, available: boolean): void;
  /** Sets the depth of the machine.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a48acbd8499c8296158562d96be4917a3 */
  setDepth(depth: number): void;
  /** Sets the dimensions of the machine as (width, depth, height).
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aee1410561c57718fea757edd6c5621ea */
  setDimensions(dimensions: Vector): void;
  /** Sets the extruder offset X-coordinate. (hidden)
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a593394f9ddf8650925f0331a28b66063 */
  setExtruderOffsetX(extruderNo: number, x: number): void;
  /** Sets the extruder offset Y-coordinate. (hidden)
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a737d119e0bd76d411d1551c1d1eb865b */
  setExtruderOffsetY(extruderNo: number, y: number): void;
  /** Sets the extruder offset Z-coordinate. (hidden)
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a1c4adc01cfdf4e7172b1563efab4760c */
  setExtruderOffsetZ(extruderNo: number, z: number): void;
  /** Sets the feedrate ratio.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#af95aad6da24083900f7fc5d7e5007cbd */
  setFeedrateRatio(feedrateRatio: number): void;
  /** Sets the height of the machine.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a6d113e2975c6a35628e8d2bd36085835 */
  setHeight(height: number): void;
  /** Sets the X-coordinate home position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a0c661273887eaf6d0291a659038f54ba */
  setHomePositionX(x: number): void;
  /** Sets the Y-coordinate home position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a01c8781c8248a1713d5791c227e1e782 */
  setHomePositionY(y: number): void;
  /** Sets the Z-coordinate home position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a33a4431df18a6fde6dc7013da2eea281 */
  setHomePositionZ(z: number): void;
  /** Sets true if inspection is supported.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a04eaae5403a94332f3042ec956b8105f */
  setInspection(inspection: boolean): void;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a905b68a8721f02c3a22646f5ca859449 */
  setIsReceived(received: boolean): void;
  /** Sets if jet is supported (waterjet, laser cutter, and plasma cutter).
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a19f3d571d59ae0ba36f8f364cb1229ad */
  setJet(jet: boolean): void;
  /** Defines the machine rewinds preference.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a054bdf88029f75da4c366adf1a4aeef8 */
  setMachineRewindPreference(rewindPreference: number, retractPreference: number): void;
  /** Sets the maximum block processing speed.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a50e4a6adc6eff7222b6ce2582fadf050 */
  setMaximumBlockProcessingSpeed(maximumBlockProcessingSpeed: number): void;
  /** Sets the maximum cutting feedrate.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a1408006deb072bf5e69cac660372c06b */
  setMaximumCuttingFeedrate(maximumCuttingFeedrate: number): void;
  /** Sets the maximum feedrate.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a3dffc3a2f42c1d682c5098b328bda6c4 */
  setMaximumFeedrate(maximumFeedrate: number): void;
  /** Sets the maximum spindle power defined in kW or hp.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#adefaa3e71fd36c3f87b0fb6f9771f469 */
  setMaximumSpindlePower(maximumSpindlePower: number): void;
  /** Sets the maximum spindle speed.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a99e17175e6075aa15b6b0d1c45902836 */
  setMaximumSpindleSpeed(maximumSpindleSpeed: number): void;
  /** Sets the maximum tool diameter.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a2394105bdd742b13011c600b676af323 */
  setMaximumToolDiameter(maximumToolDiameter: number): void;
  /** Sets the maximum tool length.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a85cff9306e07d0aebbe15ce418c7fb4f */
  setMaximumToolLength(maximumToolLength: number): void;
  /** Sets the maximum tool weight.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a099c37d5adbc2c2775f2d16a4b1bfe82 */
  setMaximumToolWeight(maximumToolWeight: number): void;
  /** Sets if milling is supported.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a5ba1945b660eb30f25c40f5bb5d130e6 */
  setMilling(milling: boolean): void;
  /** Sets the minimum spindle speed.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#abf8dd032f247c70b24f99d844da2cfa7 */
  setMinimumSpindleSpeed(minimumSpindleSpeed: number): void;
  /** Sets the multi-axis settings for feed rates
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aa1da5f8b57309ef702b68737dc68575e */
  setMultiAxisFeedrate(feedMode: number, maximumFeedrate: number, feedType: number, outputTolerance: number, bpwRatio: number): void;
  /** Sets the number of extruders. (hidden)
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#afb656c586f54fe7184fb5f9124c42653 */
  setNumberExtruders(num: number): void;
  /** Sets the maximum number of tools.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a5c190233a48b21b37717183723adcfef */
  setNumberOfTools(numberOfTools: number): void;
  /** Sets the number of work offsets.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a57bd12c170eda0bdd2ecfd4627d437d2 */
  setNumberOfWorkOffsets(numberOfWorkOffsets: number): void;
  /** Sets the X-coordinate park position. (hidden)
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aa834e541a88ca945653526b59ecfcf5c */
  setParkPositionX(x: number): void;
  /** Sets the Y-coordinate park position. (hidden)
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#abfcff16f4d2c0a89100f814706e28ac6 */
  setParkPositionY(y: number): void;
  /** Sets the Z-coordinate park position. (hidden)
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aeab9cca9a39dbf84c9b906a943070649 */
  setParkPositionZ(z: number): void;
  /** Sets the maximum allowed part dimensions.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a9780ac995979987e4f65fb553d2c6846 */
  setPartDimensions(partDimensions: Vector): void;
  /** Sets the width of the machine.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aecc2b04d3836d13e8f1ad8c5424992d6 */
  setPartMaximumX(width: number): void;
  /** Sets the depth of the machine.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a15e8362221709a6fffd0a42d9c6861a1 */
  setPartMaximumY(depth: number): void;
  /** Sets the height of the machine.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ad054fb5d7f1167c735ce3494ba4e5457 */
  setPartMaximumZ(height: number): void;
  /** Sets the reconfigure.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a09d8532b125db4bf4fcaf7ef5add0335 */
  setReconfigure(enable: boolean): void;
  /** Sets the retract on indexing mode.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a904ab40b35e09d0386f38686ee7fd6ae */
  setRetractOnIndexing(retractOnIndexing: boolean): void;
  /** Sets the values by which the stock should be expanded when computing retract moves for rewinds.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ad266573217612dc2310ccfe898a4a90b */
  setRewindStockExpansion(expansion: Vector): void;
  /** Sets the rewind strategy. Use MINIMIZE_REWINDS to minimize the number of rewinds by preferring the solution that requires the least number of rewinds before reaching the limits of the rotary axes. Use AXIS_PREFERENCE to prefer solutions that match the axis preference even if it requires more rewinds By default, it is AXIS_PREFERENCE.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a9857a30d7402e143d74fd7aabc6a3e68 */
  setRewindStrategy(rewindStrategy: number): void;
  /** Sets the safe feedrate value for plunge moves in rewinds.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ad2f5cef98e547919feeb3b9e1737c1e1 */
  setSafePlungeFeedrate(safePlungeFeedrate: number): void;
  /** Sets the safe distance value for retract moves in rewinds.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a0058376115776b24cc6b48ff288c0b68 */
  setSafeRetractDistance(safeRetractDistance: number): void;
  /** Sets the safe feedrate value for retract moves in rewinds.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a266d5c0a1a0bb6fb9d604f8fa24a91b8 */
  setSafeRetractFeedrate(safeRetractFeedrate: number): void;
  /** Sets shortest angular rotation mode.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#afc895255c77b1b089c42f63c3d00800f */
  setShortestAngularRotation(shortestAngularRotation: boolean): void;
  /** Sets the multi-axis settings specific for handling singularities in the toolpath.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a3c777f42e379d861aa59f806aebf7861 */
  setSingularity(adjust: boolean, method: number, cone: number, angle: number, tolerance: number, linearizationTolerance: number): void;
  /** Sets the spindle description.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aad3fba39881c5ea9d644bc54cb5c9d42 */
  setSpindleDescription(spindleDescription: string): void;
  /** Sets the spindle peak torque defined in Nm or ft-lb.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a6bc5b1f4f8d0d83b2e50ad19702769e9 */
  setSpindlePeakTorque(spindlePeakTorque: number): void;
  /** Sets the spindle speed at which peak torque is reached defined in RPM.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ace49aae415d6b915d4f18c04b74b5feb */
  setSpindlePeakTorqueSpeed(spindlePeakTorqueSpeed: number): void;
  /** Sets the X-coordinate tool change position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a589cb1bae6135d72e2db7d26377f5f87 */
  setToolChangePositionX(x: number): void;
  /** Sets the Y-coordinate tool change position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a567b1ce7b87119528fdfe94dd2baefa4 */
  setToolChangePositionY(y: number): void;
  /** Sets the Z-coordinate tool change position.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ac2fe1d6358f50026899be4a74fc4dfbd */
  setToolChangePositionZ(z: number): void;
  /** Sets if an automatic tool changer is available.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ab88aca6cbd09d4918c4aaf361c46714d */
  setToolChanger(toolChanger: boolean): void;
  /** Sets the tool change time.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#aac5e82a665adbb77abf4cb49d1171171 */
  setToolChangeTime(toolChangeTime: number): void;
  /** Sets the tool interface.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#ade50eede795a89c77c5caf8cac8262c8 */
  setToolInterface(toolInterface: string): void;
  /** Defines the tool length used for head coordinate adjustments. Issues an event.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a9923467b3952a32ad69baa1a057fb25c */
  setToolLength(toolLength: number): void;
  /** Defines the tool length used for head coordinate adjustments. Without issuing an event.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a068674ba30cdd8e1e220dcd42c0f125c */
  setToolLengthWithoutEvent(toolLength: number): void;
  /** Sets the tool preload.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a4c264cc0fded2ec9d7735cefa78f779c */
  setToolPreload(toolPreload: boolean): void;
  /** Sets if turning is supported.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#afd82cf9bd37e7e885b1d9cd48f82bc1c */
  setTurning(turning: boolean): void;
  /** Sets the vendor url.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a0db1e1a4799b85c02197d0504d31f893 */
  setVendorUrl(vendorUrl: string): void;
  /** Defines if the virtual tool end position should be output.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a11fe24fef81ead4a0e207e9e3ae3e0a7 */
  setVirtualTooltip(virtualPositioning: boolean): void;
  /** Sets the weight of the machine.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a84ffc671ec2a65bdf811e10d29c82d9c */
  setWeight(weight: number): void;
  /** Sets the weight capacity.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a7ccb6ad5ac157e5d105b29a5b654ef15 */
  setWeightCapacity(weightCapacity: number): void;
  /** Sets the width of the machine.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a00694c15e7c4ec74940c07c13b11dbed */
  setWidth(width: number): void;
  /** Sets if wire is supported.
   * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html#a614f6eb0560dd3ee1be52ba1bd8a3301 */
  setWire(wire: boolean): void;
}

// ---------------------------------------------------------------------------
//  Axis
// ---------------------------------------------------------------------------

/** A machine axis definition. */
declare class Axis {
  /** Returns true if the axis is valid.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a8f0546e83514d6d10458185eed4b1194 */
  isEnabled(): boolean;
  /** Returns the coordinate to which the axis coordinate is bound (0:X, 1:Y, 2:Z). Returns -1 if the axis is invalid.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#acca6a2779a77b9ab4b53aa701d3bf7e0 */
  getCoordinate(): number;
  /** Returns the range of the axis coordinate.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a723d62725db8593e5bcfa2c827d6b4f9 */
  getRange(): Range;
  /** Returns true if the axis is cyclic. Only supported for rotational axes.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a1c2d07aa5487d789618c1c760a7ab4ed */
  isCyclic(): boolean;
  /** Returns true if the axis is a table axis.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#ae71a1e3c4a7c1c3215dcbe4c55477bc3 */
  isTable(): boolean;
  /** Returns true if the axis is a head axis.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a43bfff77a151a6f3566d61e6cfa476fa */
  isHead(): boolean;
  /** Returns true if TCP is enabled for the rotary axis.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#aca3e590933704593714030fa0067164e */
  isTCPEnabled(): boolean;
  /** Returns the axis direction.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a790d980ca6d85087c3e0cf927b3e4317 */
  getAxis(): Vector;
  /** Returns the axis offset.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a1628c939ccf3ba4476fcdbbddd56db12 */
  getOffset(): Vector;
  /**
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a2a1992af4fbe85c54506bfc8623e39c7 */
  Axis(): void;
  /** Returns the closest valid angle/offset.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#afac99a497b49eb196c333bd89d25ad13 */
  clamp(value: number): number;
  /** Returns the axis value clamped to the resolution.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a926da517cc516646e52afed5a1e4101a */
  clampToResolution(_value: number): number;
  /** Returns the actuator type. 0: linear actuator. 1: rotational actuator.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a906f568ce27ceb9da71c469e7a7eb949 */
  getActuator(): number;
  /** Returns the rotation for the given axis position. Returns the identity matrix for a linear axis.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a20b04f649e9615b0a3fa5fa6f37f2ae6 */
  getAxisRotation(position: number): Matrix;
  /** Returns the axis displacement.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a592897c46c5c54745976124439346d2c */
  getDisplacement(): number;
  /** Returns the effective axis direction. Flipped for head.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#aebba76a0847fe25dff4ce60d5e444680 */
  getEffectiveAxis(): Vector;
  /** Returns the axis home position.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#aab6fd7d2d6bcf95c1349abbd91290e41 */
  getHomePosition(): number;
  /** Returns the maximum feed of the axis.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a44fb2741352871d0cbbea3bc6bcaabe7 */
  getMaximumFeed(): number;
  /** Returns the identifier for the axis.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a78ee178b6a73658d65ca60da4d1e6683 */
  getName(): string;
  /** Returns the angle/offset preference. 0: don't care. 1: prefer positive angles/offsets. -1: prefer negative angles/offsets.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a526053ca21b22b2cd4571f7bf86927ad */
  getPreference(): number;
  /** Returns the rapid feed of the axis.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a00276eb15da56c543ccecd59c26b73dd */
  getRapidFeed(): number;
  /** Returns the axis reset behavior. 0: disabled. 1: reset to 0 at new operation. 2: reset to 0 at rewind.. 3: reset to 0 at new operation and at rewind.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#ae84e04d3d78c38dac94102d7ab58a85a */
  getReset(): number;
  /** Returns the resolution of the axis.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a6d19191104fa58ecfa44fcd26242ae23 */
  getResolution(): number;
  /** Returns the signed resolution error for the specified axis value.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#aa5a85a37682e8010f0ee6d2049bce24d */
  getResolutionError(_value: number): number;
  /** Returns the tool change position as specified in the machine definition
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a801bceaecb9835fa3930f3e32ef0c8c5 */
  getToolChangePosition(): number;
  /** Returns true/false whether or not a tool change position exists
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a79e250b712865a2a6fa8057de434bb78 */
  hasToolChangePosition(): boolean;
  /** Returns true if the axes is a fixed aggregate. That is, the axis is fixed at the given position.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#abcbf5d0d56e3021f80dcaaddde8fd9c3 */
  isAggregate(): boolean;
  /** Returns true if the actuator is linear.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#aedca09fca66c25c1fbb798e0de2746eb */
  isLinear(): boolean;
  /** Returns true if the actuator is rotational.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#aec7d8d8240f22f7b05249e71b017b703 */
  isRotational(): boolean;
  /** Returns true if the specified angle/offset is within the required range.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a2227e5e8583333e228e49b9704c083e3 */
  isSupported(value: number): boolean;
  /** Returns the reduced angle closest to 0 but restricted to the supported range. Actuator must be rotational. Returns The output is in the range ]-PI; PI] unless axis is restricted to range.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#aefc6fd5e696058b61c4f75069124c573 */
  reduce(value: number): number;
  /** Returns the preferred angle in the allowed range. An exception is raised if no valid angle exists. Actuator must be rotational.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a6bdc1271af768ae268f8923bd77cef13 */
  remapToRange(angle: number): number;
  /** Returns the preferred angle in the allowed range closest to the current angle. An exception is raised if no valid angle exists. Actuator must be rotational.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#ad2564466d5dca342baa6efc8c96f32cc */
  remapToRange2(angle: number, current: number): number;
  /** Sets the actuator type. 0: linear actuator. 1: rotational actuator.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#acf0cac1a3321682040619b8712439476 */
  setActuator(actuator: number): void;
  /** Sets the maximum feed of the axis.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#ada83804b2f56ad571d9f230355f833ec */
  setMaximumFeed(_maximumFeed: number): void;
  /** Sets the identifier for the axis.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a9358eae93df5dbdb06ba989616b35ea0 */
  setName(name: string): void;
  /** Sets the angle/offset preference. 0: don't care -1: prefer negative angles/offsets. 1: prefer positive angles/offsets.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#aa6752760160a8171201a265fd4499865 */
  setPreference(preference: number): void;
  /** Sets the rapid feed of the axis.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a4c65d97af9f608076fab4b2fa943c7dd */
  setRapidFeed(_rapidFeed: number): void;
  /** Sets the axis reset behavior. 0: disabled. 1: reset to 0 at new operation. 2: reset to 0 at rewind.. 3: reset to 0 at new operation and at rewind.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#ae54d22f06433b8bf6e094bc30a8febb5 */
  setReset(reset: number): void;
  /** Sets the resolution of the axis. Radians for rotational axis.
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a6d2dbc82c1bdcc7496711f22ac9be700 */
  setResolution(resolution: number): void;
  /** Sets the tool change position
   * @see https://cam.autodesk.com/posts/reference/classAxis.html#a62d1bac57ae0fe5b8c499e3f5a071b62 */
  setToolChangePosition(position: number): void;
}

// ---------------------------------------------------------------------------
//  MachineParameters
// ---------------------------------------------------------------------------

/** Machine-specific parameters set via `machineParameters`. */
declare class MachineParameters {
  /** Specifies the distance that the machine will retract to break the chips.
   * @see https://cam.autodesk.com/posts/reference/classMachineParameters.html#ac04ee0212cf8132988bd1c7beb7bb11b */
  chipBreakingDistance: number;
  /** Specifies the safety distance above the remaining stock for which the machine will rapid down.
   * @see https://cam.autodesk.com/posts/reference/classMachineParameters.html#a7beca38d648d5f5d1f80a394a9d034ee */
  drillingSafeDistance: number;
  /** Specifies the default spindle orientation for the machine.
   * @see https://cam.autodesk.com/posts/reference/classMachineParameters.html#a4ba20db608f00297cda2cdf67487303a */
  spindleOrientation: number;
  /** Specifies the dwell time in seconds when the spindle speed changes during a drilling cycle.
   * @see https://cam.autodesk.com/posts/reference/classMachineParameters.html#ac45c485dd2eaaa51049fe59bc8b1327e */
  spindleSpeedDwell: number;
}

// ---------------------------------------------------------------------------
//  ToolTable
// ---------------------------------------------------------------------------

/** A table of tools used in the program. */
declare class ToolTable {
  /** Returns the number of tools in the tool table.
   * @see https://cam.autodesk.com/posts/reference/classToolTable.html#a8a9570e12ba2ece65269f5b9c8828ed3 */
  getNumberOfTools(): number;
  /** Returns the tool at the specified index. The index must be in the range [0; getNumberOfTools()].
   * @see https://cam.autodesk.com/posts/reference/classToolTable.html#a43844fce9e9c7acb4493140d80fac3da */
  getTool(index: number): Tool;
}

// ---------------------------------------------------------------------------
//  MoveLength
// ---------------------------------------------------------------------------

/** Provides segment lengths for multi-axis moves. */
declare class MoveLength {
  /** The total move length. */
  getRadialLength(): number;
  /** The XYZ linear distance. */
  getLinearLength(): number;
  /** Returns the ABC angular lengths. */
  getABCLength(): Vector;
  /** Gets the length of the movement of the linear axes.
   * @see https://cam.autodesk.com/posts/reference/classMoveLength.html#a27465a4d8c84d8f0dcd5cec74ec95d09 */
  getLinearMoveLength(): number;
  /** Gets the length of the movement of the rotary axes.
   * @see https://cam.autodesk.com/posts/reference/classMoveLength.html#a6216ac555b08da0c699a24bf7c0d701b */
  getRadialMoveLength(): number;
  /** Gets the length of the rotary component of the tool tip movement.
   * @see https://cam.autodesk.com/posts/reference/classMoveLength.html#a300a1cf55da541eb4a9fdc6c45ef9470 */
  getRadialToolTipMoveLength(): number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMoveLength.html#a8f0bc9ef070c8c214003d9db15297edc */
  linear: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMoveLength.html#a702a7a42d4d28fe12d1b5bc52adee3fc */
  radial: number;
  /**
   * @see https://cam.autodesk.com/posts/reference/classMoveLength.html#ae4baa2bff338ed04b62147f75c3b97ad */
  radialToolTip: number;
}

// ---------------------------------------------------------------------------
//  CircularMotion
// ---------------------------------------------------------------------------

/** Full description of a circular motion segment. */
declare class CircularMotion {
  center: Vector;
  normal: Vector;
  plane: number;
  radius: number;
  sweep: number;
  clockwise: boolean;
  /** Helical offset.
   * @see https://cam.autodesk.com/posts/reference/classCircularMotion.html#ac41ba5ae7681519310daea5cd166d09d */
  getOffset(): number;
  /** Returns the position at the specified u coordinate for the current motion (u is clamped to [0; 1]).
   * @see https://cam.autodesk.com/posts/reference/classCircularMotion.html#a62c9464783461827866ce0484f79875b */
  getPositionU(u: number): Vector;
}

// ---------------------------------------------------------------------------
//  Simulation
// ---------------------------------------------------------------------------

/** Machine simulation interface. */
declare class Simulation {
  /** Writes a simulation record. */
  write(command: string): void;
  /** Call this when activating the work coordinates for a different WCS, e.g. for a new Setup. This will let simulation know what coordinates are used in subsequent calls to moveToTargetInWorkCoords. This will automatically be done when performing a tool change cycle, but can be called separately as well.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a9851d26acb745018e26f60dc8ee35d2a */
  activateWorkCoordsForNextOperation(): void;
  /** Returns the current rotary traverse mode setting. Either ROTARY_DIRECTION_AS_PROGRAMMED or ROTARY_DIRECTION_GO_SHORTEST.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a0fee2a21aaf1b2b8866eb77c112c2c1f */
  getRotaryDirection(): number;
  /** Get whether any TCP mode is on. Returns true if TCP is ON, false if TCP is OFF.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a2af20258ffca09b774e03d8ff1c62276 */
  isTCPModeOn(): boolean;
  /** Get whether any TWP mode is ON. Returns true if any TWP mode has been set, false if TWP is OFF.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a2263416c4e84dc4e02e48177ff30cdbd */
  isTWPModeOn(): boolean;
  /** Do a move to the target in machine coordinates. Calling this will also reset the target automatically, so you must build up a new target.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a19e108364977b9d2e5aa546c2216ac11 */
  moveToTargetInMachineCoords(): void;
  /** Do a move to the target in work coordinates (ie. the post coordinates). Calling this will also reset the target automatically, so you must build up a new target.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a17db8d4f61ca0c5b44f6ddaa4c259bc8 */
  moveToTargetInWorkCoords(): void;
  /** Perform a tool change.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#aab0a6b97287efc4680ba9ae1c62aebe6 */
  performToolChangeCycle(): void;
  /** Reset the target coordinates ie. clears the current target(s).
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#aa88a1f92416451bbea7d63af594f01e9 */
  resetTarget(): void;
  /** Do a rapid retract move along the tool axis until the machine reaches a configured limit.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a007e35952052abb3e22c107b3072666a */
  retractAlongToolAxisToLimit(): void;
  /** Set the feedrate to a specific value. This setting is modal and does not get reset with the moveToTarget calls from above.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#af02552561e0f59d7d3c71c37d3cd5792 */
  setFeedrate(feedrate: number): void;
  /** Set the feedrate to max. This setting is modal and does not get reset with the moveToTarget calls from above.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#ad3cd6711d30b2e7635a99100ea5bcb09 */
  setFeedrateToMax(): void;
  /** Set the motion mode to linear (ie. G01 style movement). This setting is modal and does not get reset with the moveToTarget calls from above.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a0b17bf30fc178b710c509cae672d09ba */
  setMotionToLinear(): void;
  /** Set the motion mode to Rapid (ie. G00 style movement). This setting is modal and does not get reset with the moveToTarget calls from above.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#ae2467f156dd1071aab5af164b372b40a */
  setMotionToRapid(): void;
  /** The axis will go in direction of the signed difference.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a76811d95bfd6f3ae418c98e7c6f39bdd */
  setRotaryToGoProgrammedDirection(): void;
  /** Any rotary movement will go the shortest direction.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a36c0042b204c92abe60446ddab62b9d1 */
  setRotaryToGoShortestDirection(): void;
  /** Set the target from an axis.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a9acdc4a72dab6bba4c486dd10311b019 */
  setTarget(axis: Axis, axisPosition: number): void;
  /** Set Target A
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a7635f4ecf8ae4e9137c3c9993e7be8d1 */
  setTargetA(a: number): void;
  /** Set Target B
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a21be2846e32321a026d4a1abcf071187 */
  setTargetB(b: number): void;
  /** Set Target C
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a4edfa0af45644bb09f65cd2fe40f223b */
  setTargetC(c: number): void;
  /** Set the target from the rotary axis coordinate. coordinate 0=A, 1=B, 2=C. Values are in radians.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#af0c19c557ade94646e79244f2d67c21c */
  setTargetForCoordinate(coordinate: number, axisPosition: number): void;
  /** Set the target from an axis ID. If the id is ABC, the value will be in radians.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#ae90d9a2b559bf4c3b25623a7c9ea6e54 */
  setTargetForId(axisId: number, axisPosition: number): void;
  /** Set Target X
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#aa14e432371c9c000015ec96b6501a151 */
  setTargetX(x: number): void;
  /** Set Target Y
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a64f6b24d99bfc1dc0de33a60ecebdaa3 */
  setTargetY(y: number): void;
  /** Set Target Z
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#acee62957e8ae85b24c2cdca2a5e6f8d4 */
  setTargetZ(z: number): void;
  /** Turn the TCP mode OFF.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a62c86758431b890d1a86837a956a02e4 */
  setTCPModeOff(): void;
  /** Turn the TCP mode ON.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a0d91a13a37ee64c377cda4dbae563f5f */
  setTCPModeOn(): void;
  /** Turn the Tilted Work Plane (TWP) mode ON and align the work plane to the current pose of the machine. This emulates a typical "dynamic work offset" command where the user doesn't set the tilted work plane rotations directly. The machine MUST be rotated into position before activating this function.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a1c1599ccc603bc7fd84ace96b763321c */
  setTWPModeAlignToCurrentPose(): void;
  /** Turn the Tilted Work Plane (TWP) mode ON and set the work plane by rotations using euler angles following the passed in Euler Convention. All angles are measured in radians and the rotations follow the right hand rule. The Euler Convention should be the same as used in the Matrix::getEuler2 function. The possible Euler conventions are defined in the builtin.cps and take the form of EULER_ <order> _ <type> where <order> is the order the three rotations are performed in and <type> is either R for body convention and S for world convention. Example: Euler Convention = EULER_ZXZ_R All angles are measured in radians and the rotations follow the right hand rule. This command can be called before the machine rotation is performed, as the resulting transformed coordinate system is independent of the machine pose.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a9c1c4f364ee8c7da735d14be8e89ee07 */
  setTWPModeByEulerAngles(eulerConvention: number, angle1: number, angle2: number, angle3: number): void;
  /** Turn the Tilted Work Plane (TWP) mode ON and set the work plane orientation by rotations using spatial angles. Spatial Angles are always applied in this order: Step 1: rotation about the Z axis by angle C Step 2: rotation about the new Y axis by angle B Step 3: rotation about the new X axis by angle A All angles are measured in radians and the rotations follow the right hand rule. This command can be called before the machine rotation is performed, as the resulting transformed coordinate system is independent of the machine pose.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#a770743059256de520c1e301daf3503e0 */
  setTWPModeBySpatialAngles(angleA: number, angleB: number, angleC: number): void;
  /** Turn the TWP mode OFF.
   * @see https://cam.autodesk.com/posts/reference/classSimulation.html#af86ecd12d168dc09d998b4f9476ffe88 */
  setTWPModeOff(): void;
}

// ---------------------------------------------------------------------------
//  TextFile
// ---------------------------------------------------------------------------

/** File I/O for text files. */
declare class TextFile {
  constructor(path: string, write: boolean, encoding?: string);
  /** Reads a line.
   * @see https://cam.autodesk.com/posts/reference/classTextFile.html#ac1d63366f04f8d00f1d41bb8e3372c7a */
  readln(): string;
  /** Writes the specified text without end-of-line.
   * @see https://cam.autodesk.com/posts/reference/classTextFile.html#ac7ae9e5d1fe2c049ade8139922deb5d0 */
  write(text: string): void;
  /** Writes the specified text and an end-of-line.
   * @see https://cam.autodesk.com/posts/reference/classTextFile.html#a39e8a39e8e886dfc316a8e319840244c */
  writeln(text: string): void;
  /** Closes the file.
   * @see https://cam.autodesk.com/posts/reference/classTextFile.html#aa69c8bf1f1dcf4e72552efff1fe3e87e */
  close(): void;
  /** Returns true if the file is open.
   * @see https://cam.autodesk.com/posts/reference/classTextFile.html#aeae1bcf96ec114975226e1e24e68a5a1 */
  isOpen(): boolean;
  /** Opens a text file for reading/writing.
   * @see https://cam.autodesk.com/posts/reference/classTextFile.html#a7250f3ed10ac42942cf293508636c39f */
  TextFile(path: string, write: boolean, encoding: string): void;
}

// ---------------------------------------------------------------------------
//  FileSystem
// ---------------------------------------------------------------------------

/** Static file system utilities. */
declare class FileSystem {
  static isFolder(path: string): boolean;
  static isFile(path: string): boolean;
  static getCombinedPath(a: string, b: string): string;
  static getFolderPath(path: string): string;
  static getFilename(path: string): string;
  static replaceExtension(path: string, ext: string): string;
  static getTemporaryFolder(): string;
  static getTemporaryFile(prefix: string): string;
  static remove(path: string): void;
  static copyFile(src: string, dest: string): void;
  /** Returns the size of the specified file.
   * @see https://cam.autodesk.com/posts/reference/classFileSystem.html#a29d49d6cabef5638c21b3b60d8f5248b */
  getFileSize(path: string): number;
  /** Creates the specified folder.
   * @see https://cam.autodesk.com/posts/reference/classFileSystem.html#a1b512f57621915174cb236d9a35a2fd1 */
  makeFolder(path: string): static;
  /** Moves the specified file from the source path to the destination path.
   * @see https://cam.autodesk.com/posts/reference/classFileSystem.html#a2c7a3794ea97be54d603888f36783c59 */
  moveFile(src: string, dest: string): static;
  /** Removes the specified folder.
   * @see https://cam.autodesk.com/posts/reference/classFileSystem.html#a9da30dec50430267bf2b011dea8e1aee */
  removeFolder(path: string): static;
  /** Removes the specified folder recursively.
   * @see https://cam.autodesk.com/posts/reference/classFileSystem.html#a47c5b14c3aba2304a40b8df6389755cd */
  removeFolderRecursive(path: string): static;
}

// ---------------------------------------------------------------------------
//  StringSubstitution
// ---------------------------------------------------------------------------

/** String substitution/template engine. */
declare class StringSubstitution {
  constructor();
  setValue(key: string, value: any): void;
  substitute(template: string): string;
  /** Constructs the string substituion instance.
   * @see https://cam.autodesk.com/posts/reference/classStringSubstitution.html#aa09eb21cff5a8dac70c0217bbaef690c */
  StringSubstitution(): void;
}

// ---------------------------------------------------------------------------
//  Cycle parameters (available via the `cycle` global)
// ---------------------------------------------------------------------------

/** Cycle parameters available through the `cycle` global variable during onCycle/onCyclePoint. */
interface CycleParameters {
  /** The clearance plane (absolute coordinate). */
  clearance: number;
  /** The retract plane (absolute coordinate). */
  retract: number;
  /** The stock plane (absolute coordinate). */
  stock: number;
  /** The depth below the stock plane (positive = below stock). */
  depth: number;
  /** The bottom plane (stock - depth). Calculated by the post processor. */
  bottom: number;
  /** The primary feedrate. For drilling cycles this is the plunging feedrate. */
  feedrate: number;
  /** The plunge feedrate. Defaults to `feedrate` if not specified. */
  plungeFeedrate?: number;
  /** The retraction feedrate. Defaults to `feedrate` if not specified. */
  retractFeedrate?: number;
  /** The incremental/pecking depth. */
  incrementalDepth?: number;
  /** The incremental depth reduction per plunge. */
  incrementalDepthReduction?: number;
  /** The minimum incremental depth per plunge. */
  minimumIncrementalDepth?: number;
  /** Total plunging depth before full retract. */
  accumulatedDepth?: number;
  /** The dwell time in seconds. */
  dwell?: number;
  /** The dwell depth. */
  dwellDepth?: number;
  /** Distance to retract to break chips. */
  chipBreakDistance?: number;
  /** The number of plunges per retract. */
  plungesPerRetract?: number;
  /** The thread pitch (incremental depth per turn). */
  pitch?: number;
  /** The hole diameter. */
  diameter?: number;
  /** The shifting distance. */
  shift?: number;
  /** The shift orientation in radians. */
  shiftOrientation?: number;
  /** The compensated shift orientation. */
  compensatedShiftOrientation?: number;
  /** The shift direction in radians. */
  shiftDirection?: number;
  /** Back boring distance. */
  backBoreDistance?: number;
  /** Compensation type: "computer", "control", "wear", "inverseWear". */
  compensation?: string;
  /** Specifies climb/conventional milling direction. */
  direction?: string;
  /** Specifies left/right handed thread. */
  threading?: string;
  /** Number of passes/steps. */
  numberOfSteps?: number;
  /** Maximum stepover between passes. */
  stepover?: number;
  /** Stop spindle during positioning. */
  stopSpindle?: boolean;
  /** Repeat the final pass. */
  repeatPass?: boolean;
  /** Positioning spindle speed. */
  positioningSpindleSpeed?: number;
  /** Positioning feedrate. */
  positioningFeedrate?: number;
  /** Incremental distance along Z. */
  incrementalZ?: number;
  /** Incremental distance along X. */
  incrementalX?: number;
  /** Allow arbitrary additional cycle properties. */
  [key: string]: any;
}

// ===========================================================================
//  GLOBAL CONFIGURATION VARIABLES
//  Set at the top level of a .cps file to configure the post processor.
// ===========================================================================

/** Description for the post processor configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a76d2b0133d83c43dfd8a19286ac55325 */
declare var description: string;

/** The vendor of the post processor configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a0e91253390b868169cfe091c815515b5 */
declare var vendor: string;

/** Legal comment for the post processor configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#abd2245ee2db73566a517313ab7341618 */
declare var legal: string;

/** Specifies the minimum allowed revision of the post processor (defaults to 1).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aaf3300f01a676287e5bb963fb8810cb5 */
declare var minimumRevision: number;

/** The default filename (defaults to program name).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ae59f2daabb9fbadf96ab4fceb44d6f77 */
declare var filename: string;

/** Specifies the capability flags. CAPABILITY_MILLING, CAPABILITY_TURNING, CAPABILITY_JET, CAPABILITY_SETUP_SHEET, CAPABILITY_INTERMEDIATE, and CAPABILITY_CASCADING. The default is "CAPABILITY_MILLING".
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a201e06654b2b8875b11c419093b607b2 */
declare var capabilities: number;

/** Linearization tolerance.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a40f244d9f6d9ededaacd92c57c78a318 */
declare var tolerance: number;

/** The minimum chord length in millimeters. Not used for full circle motion.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a391ac41ffa378246cc556ff9a481c7ef */
declare var minimumChordLength: number;

/** The minimum circular radius in millimeters.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ac26721edd5466a7953a79f04f50461ac */
declare var minimumCircularRadius: number;

/** The maximum circular radius in millimeters.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ace7d1f00e4410e1f4baf57b8c29c8c02 */
declare var maximumCircularRadius: number;

/** The minimum circular sweep in radians.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8b0a3da10984e4aa76b26dfa25a757a1 */
declare var minimumCircularSweep: number;

/** The maximum circular sweep in radians.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ac3cde96c729ef76f069a1a2ebfcf5d0d */
declare var maximumCircularSweep: number;

/** Specifies that helical motion is allowed. The helical motion is linearized if false.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#adea8014cc3c4028a10b12ca27a224698 */
declare var allowHelicalMoves: boolean;

/** Specifies that spiral motion is allowed (i.e. the start and end radii are different). The spiral motion is linearized if false.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9d4c62f202e89bd94d79d5ce89b27e9a */
declare var allowSpiralMoves: boolean;

/** Specifies the allowed circular planes to be output. Set to 0 to linearize all circular motion and undefined to allow any motion. Circular motion in disabled planes will be output as linear motion using the globally specified tolerance. allowedCircularPlanes is a bit mask. PLANE_XY, PLANE_ZX, and PLANE_YZ can be used for accessing the appropriate bits. Handling all planes in onCircular() gives more flexibility with regard to the used tolerances.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8862ca499e5a7a3cfc4ece721f91b4b0 */
declare var allowedCircularPlanes: number | undefined;

/** Specifies the high feedrate for rapid traversal to high feed mapping.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#abeabefafe235ec1a3b842eb1e28e9e92 */
declare var highFeedrate: number;

/** Specifies the high feed mapping mode for rapid traversal.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aac46c23bdff2208b8f8120a9fb14e3f6 */
declare var highFeedMapping: number;

/** The output unit (defaults to the specified measurement system in the regional settings).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aa63cd118027e6af31ecb0a9a45085e43 */
declare var unit: number;

/** Specifies that the section origin should be mapped to (0, 0, 0). When disabled the post is responsible for handling the section origin. By default this is enabled. This is a special variable, and, therefore, it should be put in a comment, as per example.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a243007459395443b0a118597f18a824e */
declare var mapWorkOrigin: boolean;

/** Specifies that the section work plane should be mapped to the WCS. When disabled the post is responsible for handling the WCS and section work plane. By default this is enabled. This is a special variable, and, therefore, it should be put in a comment, as per example.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a98351569a835994527b95d62194f279c */
declare var mapToWCS: boolean;

/** Specifies that the machine configuration may change during post processing when no machine configuration is defined in the post configuration. Only one machine configuration is allowed by default when they are defined/embedded in the toolpath. This property must be set to true to allow multiple machines to be defined during post processing in which case the machine configuration will become active on onSection() calls. Any machine configuration defined in the post configuration always takes precedence.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#abec0571054956f7e2f6b1fa8fa04f62e */
declare var allowMachineChangeOnSection: boolean;

/** Specifies that the program name must be an integer.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a36d2cff7c4101e07a26220b208bdf3ee */
declare var programNameIsInteger: boolean;

/** Specifies the revision of the post processor.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aca13f92beb1248bb96ee122f08faa0e7 */
declare var revision: number;

/** Denies post processing.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aa829286062f601759659bcace02ba09f */
declare var preventPost: boolean;

/** Abort on deprecated function calls. */
declare var abortOnDeprecation: boolean;

/** Set to true to allow probing with multiple features. */
declare var probeMultipleFeatures: boolean;

/** The tolerance in millimeters used to determine if consecutive circular records can be merged into a single record. Specifying a value of 0 will not merge consecutive circular records that are the same circle.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#afb32c52466cdce9a1f230d09b12757a3 */
declare var circularMergeTolerance: number;

/** Specifies the Euler convention used for tilted workplane angles. Set to undefined to use machine angles, or use one of the EULER_* constants (0-23) to specify the convention. See EULER_XYZ_R, EULER_ZXZ_R, EULER_ZYZ_R, etc. The default is undefined .
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a14ae38de8543aaa2165ca2f61d98f3e4 */
declare var eulerConvention: number;

/** Specifies that post supports feed per revolution mode for drilling cycles. It must be explicitly set for both milling or turning posts, if they support it.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9c522363e95855fc00092877eb17ee83 */
declare var allowFeedPerRevolutionDrilling: number;

/** Whether to buffer rotary moves. */
declare var bufferRotaryMoves: boolean;

/** Supported features bitmask. */
declare var supportedFeatures: number;

/** The current section. This property is unspecified outside onSection() and onSectionEnd() invocations.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3f363483663847152552a6c19897c842 */
declare var currentSection: Section;

/** The current tool.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a95ceb07ef37166fe2eb4a49196ec22d2 */
declare var tool: Tool;

/** The current feedrate.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a33ca84fc3441ef9e94208a59659de8e2 */
declare var feedrate: number;

/** The current spindle speed in RPM. Positive for clockwise direction.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#acf8176fc3ff71d9cec8246689c6551a8 */
declare var spindleSpeed: number;

/** The current movement type. The supported types are: MOVEMENT_RAPID, MOVEMENT_LEAD_IN, MOVEMENT_CUTTING, MOVEMENT_LEAD_OUT, MOVEMENT_LINK_TRANSITION, MOVEMENT_LINK_DIRECT, MOVEMENT_RAMP_HELIX, MOVEMENT_RAMP_PROFILE, MOVEMENT_RAMP_ZIG_ZAG, MOVEMENT_RAMP, MOVEMENT_PLUNGE, MOVEMENT_PREDRILL, MOVEMENT_EXTENDED, MOVEMENT_REDUCED, MOVEMENT_FINISH_CUTTING, MOVEMENT_HIGH_FEED, MOVEMENT_DEPOSITING, MOVEMENT_BRIDGING, MOVEMENT_PIERCE_CIRCULAR, MOVEMENT_PIERCE_PROFILE, MOVEMENT_PIERCE_LINEAR, and MOVEMENT_PIERCE.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a797d5b9f2e1a2c5fabbe4707d5beb5f7 */
declare var movement: number;

/** The current radius compensation mode. The modes are: RADIUS_COMPENSATION_OFF, RADIUS_COMPENSATION_LEFT, and RADIUS_COMPENSATION_RIGHT. The current radius compensation. Defaults to RADIUS_COMPENSATION_OFF.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af956c33b96a391f96de8b64ae7ce58a4 */
declare var radiusCompensation: number;

/** The spindle axis. Defaults to TOOL_AXIS_Z.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af3e5d8cfc575aa632c1203a79634aeeb */
declare var spindleAxis: number;

/** Specifies the type of the current cycle in canned cycle mode.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8fae97ae25950a6f22a9abb097b06c23 */
declare var cycleType: string;

/** Specifies the current cycle parameters in canned cycle mode.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#acc223e94c02031add0ecad7bda263ab4 */
declare var cycle: CycleParameters;

/** Specifies that a previous cycle point has been expended for the current cycle. Defaults to false.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aff308c18e5596197b74a5228552b512c */
declare var cycleExpanded: boolean;

/** The initial cycle position.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8c30a2b6f665bd561e959cc8a4e85bd2 */
declare var initialCyclePosition: Vector;

/** The machine configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a754d1d3ad5f53d86f01e30c37444ec7e */
declare var machineConfiguration: MachineConfiguration;

/** Machine parameters.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3278d7f9975131c82562c7b467cb8a0d */
declare var machineParameters: MachineParameters;

/** An interface for telling simulation what to do. E.g. so that connections between toolpaths can be simulated appropriately. See the Detailed Description for the Simulation class.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9959b171e9934828d26b506a04b34dfb */
declare var simulation: Simulation;

/** The user-defined properties that are displayed in the Post Properties table when post processing.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a1e996849c5d6bd0559736d2f8c8ffa1f */
declare var properties: any;

/** The end position of the current motion.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a940a7a1a8031469fdd81f0dae0b28289 */
declare var end: Vector;
/**
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a53097bfd1b066d304e03e4c7a74108ef */
declare var circularCenter: Vector;
/**
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a25cc87f46f5ff0758f642abfb1109145 */
declare var circularNormal: Vector;
/**
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a5eb6bcbaa31920c75afd3b3f06cacb94 */
declare var circularRadius: number;
/**
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aaa50fe2ea8ab3b8f055c0817e29b8e7b */
declare var circularSweep: number;
/** The chord length of the current circular motion (0 for full circles). Since r45991.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a58d49d49182572b08de585be569705ec */
declare var circularChordLength: number;
/** Specifies that the currect circular motion is a full circle. Since r45991.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#afe708b5908722da4800fa430a0ec4892 */
declare var circularFullCircle: boolean;
/**
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a031350ab79bbc11dd1c961d190425ae6 */
declare var circularSpiral: boolean;
/** The helical distance for the currect circular motion. Since r45991.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a6700e5e70ce85caf32565aa750e7060b */
declare var circularHelicalDistance: number;

// ===========================================================================
//  UNIT CONSTANTS
// ===========================================================================

/** Millimeters unit constant. */
declare const MM: number;
/** Inches unit constant. */
declare const IN: number;

// ===========================================================================
//  PLANE CONSTANTS
// ===========================================================================

/** XY circular plane constant. */
declare const PLANE_XY: number;
/** ZX circular plane constant. */
declare const PLANE_ZX: number;
/** YZ circular plane constant. */
declare const PLANE_YZ: number;
/** @deprecated Use PLANE_ZX. */
declare const PLANE_XZ: number;

// ===========================================================================
//  AXIS INDEX CONSTANTS
// ===========================================================================

/** X coordinate index (0). */
declare const X: number;
/** Y coordinate index (1). */
declare const Y: number;
/** Z coordinate index (2). */
declare const Z: number;
/** A rotary index. */
declare const A: number;
/** B rotary index. */
declare const B: number;
/** C rotary index. */
declare const C: number;
/** All rotaries flag. */
declare const ABC: number;

// ===========================================================================
//  TOOL AXIS CONSTANTS
// ===========================================================================

/** Tool axis along X (YZ-plane). */
declare const TOOL_AXIS_X: number;
/** Tool axis along Y (ZX-plane). */
declare const TOOL_AXIS_Y: number;
/** Tool axis along Z (XY-plane). */
declare const TOOL_AXIS_Z: number;

// ===========================================================================
//  CAPABILITY CONSTANTS
// ===========================================================================

declare const CAPABILITY_MILLING: number;
declare const CAPABILITY_TURNING: number;
declare const CAPABILITY_JET: number;
declare const CAPABILITY_SETUP_SHEET: number;
declare const CAPABILITY_INTERMEDIATE: number;
declare const CAPABILITY_MACHINE_SIMULATION: number;

// ===========================================================================
//  FEATURE CONSTANTS
// ===========================================================================

declare const FEATURE_MACHINE_ROTARY_ANGLES: number;

// ===========================================================================
//  RADIUS COMPENSATION CONSTANTS
// ===========================================================================

/** Radius compensation off (center). */
declare const RADIUS_COMPENSATION_OFF: number;
/** Left radius compensation. */
declare const RADIUS_COMPENSATION_LEFT: number;
/** Right radius compensation. */
declare const RADIUS_COMPENSATION_RIGHT: number;

// ===========================================================================
//  COOLANT CONSTANTS
// ===========================================================================

/** Coolant disabled. */
declare const COOLANT_DISABLED: number;
/** Flood coolant. */
declare const COOLANT_FLOOD: number;
/** Mist coolant. */
declare const COOLANT_MIST: number;
/** @deprecated Use COOLANT_THROUGH_TOOL. */
declare const COOLANT_TOOL: number;
/** Through-tool coolant. */
declare const COOLANT_THROUGH_TOOL: number;
/** Air coolant. */
declare const COOLANT_AIR: number;
/** Air through tool. */
declare const COOLANT_AIR_THROUGH_TOOL: number;
/** Suction. */
declare const COOLANT_SUCTION: number;
/** Flood and mist. */
declare const COOLANT_FLOOD_MIST: number;
/** Flood and through-tool. */
declare const COOLANT_FLOOD_THROUGH_TOOL: number;

// ===========================================================================
//  MATERIAL CONSTANTS
// ===========================================================================

declare const MATERIAL_UNSPECIFIED: number;
declare const MATERIAL_HSS: number;
declare const MATERIAL_TI_COATED: number;
declare const MATERIAL_CARBIDE: number;
declare const MATERIAL_CERAMICS: number;

// ===========================================================================
//  TOOL TYPE CONSTANTS
// ===========================================================================

declare const TOOL_UNSPECIFIED: number;
declare const TOOL_DRILL: number;
declare const TOOL_DRILL_CENTER: number;
declare const TOOL_DRILL_SPOT: number;
declare const TOOL_DRILL_BLOCK: number;
declare const TOOL_MILLING_END_FLAT: number;
declare const TOOL_MILLING_END_BALL: number;
declare const TOOL_MILLING_END_BULLNOSE: number;
declare const TOOL_MILLING_CHAMFER: number;
declare const TOOL_MILLING_FACE: number;
declare const TOOL_MILLING_SLOT: number;
declare const TOOL_MILLING_RADIUS: number;
declare const TOOL_MILLING_DOVETAIL: number;
declare const TOOL_MILLING_TAPERED: number;
declare const TOOL_MILLING_LOLLIPOP: number;
declare const TOOL_MILLING_FORM: number;
declare const TOOL_MILLING_THREAD: number;
declare const TOOL_TAP_RIGHT_HAND: number;
declare const TOOL_TAP_LEFT_HAND: number;
declare const TOOL_REAMER: number;
declare const TOOL_BORING_BAR: number;
declare const TOOL_COUNTER_BORE: number;
declare const TOOL_COUNTER_SINK: number;
declare const TOOL_HOLDER_ONLY: number;
declare const TOOL_TURNING_GENERAL: number;
declare const TOOL_TURNING_THREADING: number;
declare const TOOL_TURNING_GROOVING: number;
declare const TOOL_TURNING_BORING: number;
declare const TOOL_TURNING_CUSTOM: number;
declare const TOOL_PROBE: number;
declare const TOOL_WIRE: number;
declare const TOOL_WATER_JET: number;
declare const TOOL_LASER_CUTTER: number;
declare const TOOL_PLASMA_CUTTER: number;
declare const TOOL_WELDER: number;
declare const TOOL_GRINDER: number;
declare const TOOL_MARKER: number;

// ===========================================================================
//  TOOL COMPENSATION CONSTANTS
// ===========================================================================

declare const TOOL_COMPENSATION_INSERT_CENTER: number;
declare const TOOL_COMPENSATION_TIP: number;
declare const TOOL_COMPENSATION_TIP_CENTER: number;
declare const TOOL_COMPENSATION_TIP_TANGENT: number;

// ===========================================================================
//  MOVEMENT CONSTANTS
// ===========================================================================

/** Rapid movement. */
declare const MOVEMENT_RAPID: number;
/** Lead-in movement. */
declare const MOVEMENT_LEAD_IN: number;
/** Cutting movement. */
declare const MOVEMENT_CUTTING: number;
/** Lead-out movement. */
declare const MOVEMENT_LEAD_OUT: number;
/** Transition linking movement. */
declare const MOVEMENT_LINK_TRANSITION: number;
/** Direct linking movement. */
declare const MOVEMENT_LINK_DIRECT: number;
/** Helical ramp. */
declare const MOVEMENT_RAMP_HELIX: number;
/** Profile ramp. */
declare const MOVEMENT_RAMP_PROFILE: number;
/** Zig-zag ramp. */
declare const MOVEMENT_RAMP_ZIG_ZAG: number;
/** General ramp. */
declare const MOVEMENT_RAMP: number;
/** Plunge movement. */
declare const MOVEMENT_PLUNGE: number;
/** Predrill movement. */
declare const MOVEMENT_PREDRILL: number;
/** Extended movement. */
declare const MOVEMENT_EXTENDED: number;
/** Reduced cutting feed. */
declare const MOVEMENT_REDUCED: number;
/** Finish cutting. */
declare const MOVEMENT_FINISH_CUTTING: number;
/** High-feed movement. */
declare const MOVEMENT_HIGH_FEED: number;
/** Depositing (additive). */
declare const MOVEMENT_DEPOSITING: number;
/** Bridging (additive). */
declare const MOVEMENT_BRIDGING: number;
/** Connection between toolpaths. */
declare const MOVEMENT_CONNECTION: number;
/** Drill breakthrough. */
declare const MOVEMENT_DRILL_BREAKTHROUGH: number;
/** Gun drill positioning. */
declare const MOVEMENT_GUN_DRILL_POSITIONING: number;
/** Circular pierce (jet). */
declare const MOVEMENT_PIERCE_CIRCULAR: number;
/** Profile pierce (jet). */
declare const MOVEMENT_PIERCE_PROFILE: number;
/** Linear pierce (jet). */
declare const MOVEMENT_PIERCE_LINEAR: number;
/** Plunge pierce (jet). */
declare const MOVEMENT_PIERCE: number;

// ===========================================================================
//  COMMAND CONSTANTS (for onCommand)
// ===========================================================================

declare const COMMAND_STOP: number;
declare const COMMAND_OPTIONAL_STOP: number;
declare const COMMAND_END: number;
declare const COMMAND_SPINDLE_CLOCKWISE: number;
declare const COMMAND_SPINDLE_COUNTERCLOCKWISE: number;
declare const COMMAND_START_SPINDLE: number;
declare const COMMAND_STOP_SPINDLE: number;
declare const COMMAND_ORIENTATE_SPINDLE: number;
declare const COMMAND_LOAD_TOOL: number;
declare const COMMAND_COOLANT_ON: number;
declare const COMMAND_COOLANT_OFF: number;
declare const COMMAND_ACTIVATE_SPEED_FEED_SYNCHRONIZATION: number;
declare const COMMAND_DEACTIVATE_SPEED_FEED_SYNCHRONIZATION: number;
declare const COMMAND_LOCK_MULTI_AXIS: number;
declare const COMMAND_UNLOCK_MULTI_AXIS: number;
declare const COMMAND_EXACT_STOP: number;
declare const COMMAND_START_CHIP_TRANSPORT: number;
declare const COMMAND_STOP_CHIP_TRANSPORT: number;
declare const COMMAND_OPEN_DOOR: number;
declare const COMMAND_CLOSE_DOOR: number;
declare const COMMAND_BREAK_CONTROL: number;
declare const COMMAND_TOOL_MEASURE: number;
declare const COMMAND_CALIBRATE: number;
declare const COMMAND_VERIFY: number;
declare const COMMAND_CLEAN: number;
declare const COMMAND_ALARM: number;
declare const COMMAND_ALERT: number;
declare const COMMAND_CHANGE_PALLET: number;
declare const COMMAND_POWER_ON: number;
declare const COMMAND_POWER_OFF: number;
declare const COMMAND_MAIN_CHUCK_OPEN: number;
declare const COMMAND_MAIN_CHUCK_CLOSE: number;
declare const COMMAND_SECONDARY_CHUCK_OPEN: number;
declare const COMMAND_SECONDARY_CHUCK_CLOSE: number;
declare const COMMAND_SECONDARY_SPINDLE_SYNCHRONIZATION_ACTIVATE: number;
declare const COMMAND_SECONDARY_SPINDLE_SYNCHRONIZATION_DEACTIVATE: number;
declare const COMMAND_SYNC_CHANNELS: number;
declare const COMMAND_PROBE_ON: number;
declare const COMMAND_PROBE_OFF: number;

// ===========================================================================
//  HIGH FEED MAPPING CONSTANTS
// ===========================================================================

/** Do not map rapids to high feed. */
declare const HIGH_FEED_NO_MAPPING: number;
/** Map multi-axis rapids to high feed. */
declare const HIGH_FEED_MAP_MULTI: number;
/** Map rapids along XY or Z to high feed. */
declare const HIGH_FEED_MAP_XY_Z: number;
/** Map all rapids to high feed. */
declare const HIGH_FEED_MAP_ANY: number;

// ===========================================================================
//  SECTION TYPE CONSTANTS
// ===========================================================================

declare const TYPE_MILLING: number;
declare const TYPE_TURNING: number;
declare const TYPE_JET: number;

// ===========================================================================
//  OPTIMIZE CONSTANTS
// ===========================================================================

declare const OPTIMIZE_NONE: number;
declare const OPTIMIZE_TABLES: number;
declare const OPTIMIZE_BOTH: number;
declare const OPTIMIZE_AXIS: number;

// ===========================================================================
//  SINGULARITY LINEARIZE CONSTANTS
// ===========================================================================

declare const SINGULARITY_LINEARIZE_OFF: number;
declare const SINGULARITY_LINEARIZE_LINEAR: number;
declare const SINGULARITY_LINEARIZE_ROTARY: number;

// ===========================================================================
//  STRATEGY GROUP CONSTANTS
// ===========================================================================

declare const STRATEGY_MULTIAXIS: number;
declare const STRATEGY_2D: number;
declare const STRATEGY_3D: number;
declare const STRATEGY_DRILLING: number;
declare const STRATEGY_TURNING: number;
declare const STRATEGY_JET: number;
declare const STRATEGY_PROBING: number;
declare const STRATEGY_INSPECTION: number;
declare const STRATEGY_ADDITIVE: number;

// ===========================================================================
//  FEED MODE CONSTANTS
// ===========================================================================

declare const FEED_PER_MINUTE: number;
declare const FEED_PER_REVOLUTION: number;
declare const FEED_INVERSE_TIME: number;

// ===========================================================================
//  CONTENT FLAG CONSTANTS
// ===========================================================================

declare const HAS_PARAMETER: number;
declare const HAS_RAPID: number;
declare const HAS_LINEAR: number;
declare const HAS_DWELL: number;
declare const HAS_CIRCULAR: number;
declare const HAS_CYCLE: number;
declare const HAS_WELL_KNOWN_COMMAND: number;
declare const HAS_COMMENT: number;

// ===========================================================================
//  RECORD TYPE CONSTANTS
// ===========================================================================

declare const RECORD_INVALID: number;
declare const RECORD_WELL_KNOWN_COMMAND: number;
declare const RECORD_MACHINE_COMMAND: number;
declare const RECORD_SPINDLE_SPEED: number;
declare const RECORD_PARAMETER: number;
declare const RECORD_LINEAR: number;
declare const RECORD_LINEAR_5D: number;
declare const RECORD_LINEAR_ZXN: number;
declare const RECORD_LINEAR_EXTRUDE: number;
declare const RECORD_CIRCULAR: number;
declare const RECORD_DWELL: number;
declare const RECORD_CYCLE: number;
declare const RECORD_CYCLE_OFF: number;
declare const RECORD_COMMENT: number;
declare const RECORD_WIDE_COMMENT: number;
declare const RECORD_PASS_THROUGH: number;
declare const RECORD_WIDE_PASS_THROUGH: number;
declare const RECORD_OPERATION: number;
declare const RECORD_OPERATION_END: number;
declare const RECORD_CIRCULAR_EXTRUDE: number;

// ===========================================================================
//  ASCII CONTROL CODES & SPECIAL STRINGS
// ===========================================================================

declare const EOL: string;
declare const SP: string;
declare const PATH_SEPARATOR: string;
declare const NUL: string;
declare const SOH: string;
declare const STX: string;
declare const ETX: string;
declare const EOT: string;
declare const CR: string;
declare const LF: string;
declare const TAB: string;

// ===========================================================================
//  GLOBAL FUNCTIONS
// ===========================================================================

// ---- Output Functions ----

/** Writes the specified text to the NC output file excluding an end-of-line marker.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a32071fff63a93a3494979e835aaacc9a */
declare function write(message: string): void;

/** Writes the specified text to the NC output file including an end-of-line marker.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aeb90bf455982d43746741f6dce58279c */
declare function writeln(message: string): void;

/** Writes the specified words to the NC output file including an end-of-line marker using the word separator (see getWordSeparator() and setWordSeparator()). Empty strings or undefined values are ignored. No line is output for completely empty lines.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a2e458cd4cdf20806ac7afaf13232a779 */
declare function writeWords(...words: string[]): void;

/** This method is similar to writeWords() with the exception that text is only output if the 2 argument or above results in text. This function is useful when outputting block numbers to avoid output.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a26a51e1eef93cfd3f7dcf66da436583b */
declare function writeWords2(...words: string[]): void;

/** Returns the string output by writeWords() without end-of-line.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a891175b41f166fce83100d6cbd6d4504 */
declare function formatWords(...words: string[]): string;

/** Returns the separator for word-based the line output.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ada0c57582300da66213635ccc64c8e7f */
declare function getWordSeparator(): string;

/** Sets the separator for word-based line output. Defaults to a space (i.e. " ").
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aea95987c6248d8d46db8e7481609fe4d */
declare function setWordSeparator(separator: string): void;

/** Writes the notes for the current section as comments.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ad3fe4cd43679cb02596baa1d72c4e0e5 */
declare function writeSectionNotes(): void;

/** Writes an error message and aborts the script.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a41de7e97313422e0fa1ff6265901b0e8 */
declare function error(message: string): void;

/** Writes a warning.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a142480b11a33b89259a93b16d67b35b9 */
declare function warning(message: string): void;

/** Writes the specified warning if the given warning id has not been used before.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a7c84675981a0f7e9672c2653298b344d */
declare function warningOnce(message: string, id: number): void;

/** Writes the specified message to the log.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a5d7d1f99129bbc3846054e8d5b70cb48 */
declare function log(message: string): void;

/** Raises an exception if the expression is false. Use this function to make sure that you have protected your code against invalid cases.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a37d7c88322479cc4b8775219c7104161 */
declare function validate(expression: any, message: string): void;

// ---- Unit / Conversion Functions ----

/** Returns the specified spatial value and unit in the internal unit. Note: IN values are scaled with 25 relative to MM.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a237487f4656f95641ef1d26ca62b7b01 */
declare function spatial(value: number, unit: number): number;

/** Returns the specified value in the output unit. Note: The unit conversion scale used is 25mm to 1in and not 25.4.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a7de682c8593fcacc60e146467563e52d */
declare function toUnit(value: number, unit: number): number;

/** Returns the specified value in the output unit. Note: The unit conversion scale used is 25.4.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a2f33c593779c135e774347331310dd14 */
declare function toPreciseUnit(value: number, unit: number): number;

/** Returns the specified angle in degrees.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a27965dc305215f673efcea4330d2431a */
declare function toDeg(radians: number): number;

/** Returns the specified angle in radians.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a40562fe347c39025af57410c92c2c373 */
declare function toRad(degrees: number): number;

/** Returns the number of sections.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a057dfc309ce401ba7b500c9f02932400 */
declare function getNumberOfSections(): number;

/** Returns the specified section. The index must be in the range [0; getNumberOfSections()].
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af315a19e0323fb203e0722c78cd8489e */
declare function getSection(index: number): Section;

/** Returns the previous section. Must be called within a section.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a37f8e29d0e0d1dc7a72686213017291d */
declare function getPreviousSection(): Section;

/** Returns the next section.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a45b53bd6d47a8cb66a4f7b9c48d3b612 */
declare function getNextSection(): Section;

/** Returns true if the current section is the last section.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a88727127d8244592c3fa9b2e038824d6 */
declare function isLastSection(): boolean;

/** Returns true for turning toolpath.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a628370dfe60afca3c10d0bc35add6b4f */
declare function isTurning(): boolean;

/** Returns true if the program is a 3D program (i.e. the tool axis points along the Z-axis for all the sections).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aeb49e46594378647705034b03affee0a */
declare function is3D(): boolean;

/** Returns the current position.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a067bc8148cdc35daadb8afb07ec3f63a */
declare function getCurrentPosition(): Vector;

/** Sets the current position.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a4f55914630113a4e4d015f425385156a */
declare function setCurrentPosition(position: Vector): void;

/** Returns the specified section position in the current frame specified using setRotation() and setTranslation().
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a16fc4a2c23c1cc1514ff7c58a4c9bce0 */
declare function getFramePosition(position: Vector): Vector;

/** Returns the specified section direction in the current frame specified using setRotation().
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a5f40fc8085854d4890cc4c9c685c58cc */
declare function getFrameDirection(direction: Vector): Vector;

/** Returns the specified position in the current section in the WCS. You likely want to use getGlobalPosition() instead.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ad766e32a70e707566cbc6c2f434223cd */
declare function getWCSPosition(p: Vector): Vector;

/** Returns the tool axis if the section is not optimized for the machine. Returns the rotary angles if the section is optimnized for the machine.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a1430d74a67b17577acf940ab77773585 */
declare function getCurrentDirection(): Vector;

/** Returns the current ABC position.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aceaece44998483b92f9ea5be52f7aa13 */
declare function getCurrentABC(): Vector;

/** Returns the current tool axis.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9e70702d4117aed3ccfaffd12ab5738e */
declare function getCurrentToolAxis(): Vector;

/** Sets the rotation. This is normally used for rotating around the tool axis.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a41162be7196b5b671c195807c9bbb7fc */
declare function setRotation(rotation: Matrix): void;

/** Sets the translation.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3d7f8b45d5022e52d44b05540674c17c */
declare function setTranslation(translation: Vector): void;

/** Cancels any active output frame transformation defined by setRotation() and setTranslation().
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ae7825cd471b7b6882817540ffbc73644 */
declare function cancelTransformation(): void;

/** Returns the current translation.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3d002f4077b45f2d82c61c6f6396ba13 */
declare function getTranslation(): Vector;

// ---- Machine Configuration Functions ----

/** Returns the active machine configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a50d1979cdb845a2b7c34301136930623 */
declare function getMachineConfiguration(): MachineConfiguration;

/** Sets the active machine configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ad38400d98dcd5a7ac881ba38ee096187 */
declare function setMachineConfiguration(machine: MachineConfiguration): void;

/** Constructs a new machine axis. The supported specifiers are:
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8803b36be6893a81991049766abe0794 */
declare function createAxis(specifiers: object): Axis;

/** Optimizes the machine angles for 5-axis motion using the active machine configuration. The directions for onRapid5D() and onLinear5D() are hereafter mapped to machine angles from the initial direction vector. The work plane and origin are mapped into the WCS plane and origin.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ab044d9c3d63e55f60c3a0d430287b75b */
declare function optimizeMachineAngles2(optimizeType: number): void;

/** Returns an object containing length information about the current multiaxis move.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af058edfd50a0b8e35fc3094c3644bdfe */
declare function getMultiAxisMoveLength(x: number, y: number, z: number, a: number, b: number, c: number): MoveLength;

// ---- Format / Variable Creation Functions ----

/** Constructs the format specification for the given values. The supported specifiers are: The following specifiers are deprecated since r45892. You cannot mix the new specifiers with the deprecated specifiers in a single command.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a0595eae6f27f88872305a126a5db119b */
declare function createFormat(specifiers: object): FormatNumber;

/** Creates a new OutputVariable instance. The supported specifiers are:
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8058a96192a419464ec439ad745a3f97 */
declare function createOutputVariable(specifiers: object, format: FormatNumber): OutputVariable;

/** Creates a new Variable instance. DEPRECATED, use createOutputVariable. The supported specifiers are:
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aacf9c27543d7dbec4d66d7e37a259ad3 */
declare function createVariable(specifiers: object, format: FormatNumber): Variable;

/** Creates a new ReferenceVariable instance. DEPRECATED, use createOutputVariable. The supported specifiers are: The supported specifiers are:
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ae514eb97bff185e62ed1a65d26650087 */
declare function createReferenceVariable(specifiers: object, format: FormatNumber): ReferenceVariable;

/** Creates a new Modal instance. DEPRECATED, use createOutputVariable. The supported specifiers are:
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a171d6ddae8c04c1ad624561972ad86fd */
declare function createModal(specifiers: object, format: FormatNumber): Modal;

/** May be invoked in cycle mode to expand a well-known cycle. Used when a specific cycle is not supported by a control.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#adcaaa09d41e9c6b4434cbc54fa5260e1 */
declare function expandCyclePoint(x: number, y: number, z: number): void;

/** Returns an error message if the current cycle is not supported.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a6d8623fab197e7d15ea1c71d9d283869 */
declare function cycleNotSupported(): void;

/** Returns true if the current cycle point is the last motion for the current cycle. Returns false if cycle is not active.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af571e355eb4565d09ba992b6950327a4 */
declare function isLastCyclePoint(): boolean;

/** Returns the number of cycle points for the current cycle.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a4b3cdd32aafe3c3c798bb082c6867bbe */
declare function getNumberOfCyclePoints(): number;

/** Returns true if the given cycle is a probing cycle.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a87de040424e7745da9c117d10cb85274 */
declare function isProbingCycle(uri: string): boolean;

/** Returns true if the current cycle is a well-known cycle.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#acac36f67f92aa367fab39903934d6ee8 */
declare function isWellKnownCycle(): boolean;

// ---- Tool Functions ----

/** Returns the first tool.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#adadd5d3ac553a53aeb010a4f0347622f */
declare function getFirstTool(): Tool;

/** Returns an array of tools used in the program deemed different based on the 'arguments' and 'flag' criteria. Returns an array of {tool, operations, range} objects. 'tool' is the Tool object, 'operations' is a list of operation ID's that the tool is used in, and 'range' contains the minimum and maximum Z-values for a 3D operation, it will be 'undefined' if the tool is used in a 3+2 or multi-axis operation.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a52c939232474c2c445ce2a31c3d3ca09 */
declare function getToolList(arguments_: string, flag: number): Tool[];

/** Returns whether a tool change is needed, based on the given criteria as arguments. If "description" is provided as an argument, then the tool description must be defined or an error will be generated. Returns whether a tool change is needed
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ab401f18d3ec0987c6fc0f86a9103baa2 */
declare function isToolChangeNeeded(section: Section, arguments_?: string): boolean;

/** Returns true if the specified parameter has been defined globally.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a7195e2b716f4f40604e0697e3df6634e */
declare function hasGlobalParameter(name: string): boolean;

/** Returns true if the specified parameter has been defined. Only parameters before the current record will be checked.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af023fd31344206b149bafc7650e0c940 */
declare function hasParameter(name: string): boolean;

/** Returns the value of the specified post property. If the specified property doesn't exist, it returns the default value if specified, otherwise it returns undefined. You can retrieve an operation property of a specific section by using the 'section.getProperty()' function. It takes the same arguments as getProperty(). Since r45811. e.g.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8f6be90781835876e83f3f9c3a2a9f2e */
declare function getProperty(property: any, defaultValue?: any): any;

/** Validates the property definitions.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a839f5acba612e862aae67a7f3c1b9a2b */
declare function validatePropertyDefinitions(): boolean;

/** Returns whether a new work plane is needed for the given section.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af94e1ac219746838218be332fb272bf8 */
declare function isNewWorkPlane(section: Section): boolean;

/** Returns the center for the current circular motion. Returns an unspecified value if the current motion is not circular.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a4a3bd36cc0505a436d04a075b5859621 */
declare function getCircularCenter(): Vector;
/** Returns the start radius for the current circular motion. Returns an unspecified value if the current motion is not circular. The start radius can only be different from the end radius returned by getCircularRadius() for spiral motion.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ad1f4ccaaa63345424b7415963ec80ded */
declare function getCircularStartRadius(): number;
/** Returns the sweep for the current circular motion. Returns an unspecified value if the current motion is not circular.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aad5ef0043a072e5f6ce29599dcdef834 */
declare function getCircularSweep(): number;
/** Returns the arc length for the current circular motion. Returns an unspecified value if the current motion is not circular.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a41c5fd5a58336d26c0e6edc0cda9b9ee */
declare function getCircularArcLength(): number;
/** Returns true if the current circular motion is a full circle (360deg). Returns an unspecified value if the current motion is not circular.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a74f987323d32e2762089b9b362c6b60a */
declare function isFullCircle(): boolean;
/** Returns true if the current circular motion is a spiral (i.e. the start and end radii do not match). Returns an unspecified value if the current motion is not circular.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a447e7f4006c2b605018baab2bfdabe5b */
declare function isSpiral(): boolean;
/** Returns the circular plane. Returns -1 is the plane is not in a primary plane.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9af70d71dbee56dbfacb9ce283da1ce7 */
declare function getCircularPlane(): number;
/** Returns the helical distance of the current circular motion. Returns 0 for non-helical motion. Returns an unspecified value if the current motion is not circular.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a96214a6da857c2022958e6c45882e71c */
declare function getHelicalDistance(): number;
/** Returns true if the current record can be linearized using getPositionU(). Only circular records can currently be linearized. The tolerance is specified in MM.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a605bd7365e4259f11c9fffe28d175683 */
declare function canLinearize(): boolean;
/** Returns the number of segments required to linearize the current record.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ac0dbda9694a527f908e8c2ebef2d2988 */
declare function getNumberOfSegments(tolerance: number): number;
/** Returns the end position for the current motion.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ae1205714f17006e7661bb4bf13f375ae */
declare function getEnd(): Vector;
/** Returns the current feedrate.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a27e3d8031aee29214c5b53a7187417c3 */
declare function getFeedrate(): number;
/** Returns the current power mode (water jet, laser cutter, and plasma cutter).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ae4953c80634f34150b10c6eb77fc3a8b */
declare function getPower(): boolean;
/** Returns the current radius compensation
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aba3988819e4ca7384653a48f5af26d61 */
declare function getRadiusCompensation(): number;

// ---- Redirection Functions ----

/** Redirects output to the specified file. Security: Requires security level 0.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8612c292f8ea8f81813001392515d044 */
declare function redirectToFile(path: string): void;
/** Returns the current content of the redirection buffer.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3d300af67f08e8eaa4548742ed519c5f */
declare function getRedirectionBuffer(): string;
/** Closes any redirection and switches to normal output. If redirection to buffer is active the buffer is cleared.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a1d48b58a5dbbe8838f7c557bc5bb357e */
declare function closeRedirection(): void;

// ---- Path / File Functions ----

/** Returns the path on the destination file.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a0a216f865e06399d8e1af0f6da5a6be0 */
declare function getOutputPath(): string;
/** Returns the path on the configuration file.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af4dfac9925e81b5a9a715639cab54c8d */
declare function getConfigurationPath(): string;
/** Returns the path on the running post processor.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a99de5f9f20c026a2e9fedabb5a5c480b */
declare function getPostProcessorPath(): string;
/** Includes the specified post processing script.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a92ca78e202ec522d37d4773ec3a37541 */
declare function include(path: string): void;
/** Returns the localized text for the specified native text if the result is supported in the active code page/encoding. Otherwise the original text is returned.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a336174d3ff096f7bcb809c6fb3893e23 */
declare function localize(message: string): string;

/** Returns the language id.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9584192e467c9bc0b08bcf8d70436a95 */
declare function getLangId(): string;

/** Returns the current output code page id.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a7d5e6896041e74f6785b1f25189d7b74 */
declare function getCodePage(): number;

/** Returns the specified value if the condition is true and otherwise the empty string.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a40f235f2a37336416b69e72f53d04fa2 */
declare function conditional(condition: any, value: string): string;

/** Returns a new string with all characters not present in keep removed.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ab924009686e0b4fa1b363a946c21b648 */
declare function filterText(text: string, keep: string): string;

/** Returns a new string with the named substrings of the first argument substituted by the specified arguments. This method supports up to 16 arguments.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af80b7272cd5dd0f7f99a1a236247a638 */
declare function subst(message: string, ...args: any[]): string;

/** Converts the specified text to a float. Raises an exception if all the specified text cannot be converted.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8cbd3635d767a591d11206722ac593f9 */
declare function getAsFloat(text: string): number;

/** Returns the output unit.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aca73af21b3d2186fc803fe680f1d6f38 */
declare function getOutputUnit(): number;
/** Returns the dog-leg flag. The default is false.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3471aa215809eeb7d857e2db6a099eeb */
declare function getDogLeg(): boolean;
/** Sets the EOL style. Windows EOL style CRLF is the default.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#afc3adcad7debce557de1aefe9c491d81 */
declare function setEOL(eol: string): void;
/** Tells the post processor to skip the remaining of the current section. onSectionEnd() will still be invoked.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3fa7cf1713aa6d66f84ac3e6fea769a3 */
declare function skipRemainingSection(): void;
/** Returns the inverse time (F).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#accfe735dd76556e25b597ee506b4d414 */
declare function getInverseTime(distance: number, speed: number): number;
/** Returns the standard G-code plane number (17, 18, or 19). PLANE_XY: 17 PLANE_ZX: 18 PLANE_YZ: 19 Returns 0 for all other planes.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ac04586b1089c5c2f30e4e56bb187ba2a */
declare function getISOPlane(plane: number): number;
/** Returns the quadrant for the specified angle (0 -> 3).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3dff57fe1bff7929f791c78f072d8a5c */
declare function getQuadrant(angle: number): number;
/** Returns the fixture bounding box.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a0e75c92b9d1e3fa1155c1bf2fa29e56d */
declare function getFixture(): BoundingBox;
/** Get the program name as an Integer if it is within the [min, max] range, or error otherwise.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3ae713848a4348b6a1366d12b1b1c886 */
declare function getProgramNameAsInt(min: number, max: number): number;
/** Returns the Z range for the currently active tool, for the current and upcoming consecutive sections that use this tool. Returns undefined if the tool does not have a Z axis (e.g. on 2D operations). Returns the Range for the tool's Z axis.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a250bca3a3a1a32ad8798b8d172e5ccc7 */
declare function toolZRange(): Range;
/** Returns the platform identifier. E.g. "WIN32" for Windows and "OSX" for Mac OS X.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#adf1be112d5f70697ded4b3e5465d37f2 */
declare function getPlatform(): string;
/** Returns the version of the software component.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a12b5671e8920e8ce5c4457ea8d0d9fb2 */
declare function getVersion(): string;
/** Returns the specified material as a string.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a6642268d6ed91ea9b516820913f247f4 */
declare function getMaterialName(material: number): string;
/** Returns true if the specified command is well-known.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3e865d9162a02f0e92e349fbadbd5e0c */
declare function isWellKnownCommand(command: number): boolean;
/** Writes an error message for the specified command.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8a05d18dfacdbd16cadf68bb4346e0aa */
declare function onUnsupportedCommand(command: number): void;
/** Registers a termination handler to be called after onTerminate(). The termination handlers are called in the opposite order of registration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a927541aef6a94ce44f99b01f3727ee72 */
declare function registerTerminationHandler(fn: Function): void;
/** Loads the specified machine configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a44e37f1703ec1a53346741ed2524d480 */
declare function loadMachineConfiguration(path: string): MachineConfiguration;
/** Returns the security level in which is post processor is running.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ad2e9135827033f0de36ccf48557cf04a */
declare function getSecurityLevel(): number;
/** Returns the specified record.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a0a2b6f4236b1d7ffa123d6a49a149791 */
declare function getRecord(id: number): Record;
/** Returns true if the current motion is a result of an expanded motion. Expanded motion is for instance produced by expandCyclePoint().
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a02a2028fad06308dcd85b70cb04d4a52 */
declare function isExpanding(): boolean;
/** Returns whether the current section is an inspection operation Returns true if section is an inspection operation, otherwise returns false
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a642a1927f57fb8cc76caf97e8d57ff51 */
declare function isInspectionOperation(section: Section): boolean;
/** Returns whether the current section is a drilling operation Returns true if section is a drilling operation, otherwise returns false
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a7216eb38f0a20d1b80f7a6997d72b812 */
declare function isDrillingCycle(section: Section, checkBoringCycles?: boolean): boolean;
/** Returns whether the current section is an axial center drilling operation Returns true if section is an axial center drilling operation, otherwise returns false
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a41f9c0e32ddbad2431dc5ef8a1afaf05 */
declare function isAxialCenterDrilling(section: Section, checkLiveTool?: boolean): boolean;
/** Returns an array with values in the requested range. range(end) range(first, end) range(first, end, step)
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#afad3cc545e7389e65984f259550d7f77 */
declare function range(first: number, end: number, step?: number): number[];
/** Flattens the specified array.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3c74249c9ab6fe2ab2a8638a116b146a */
declare function flatten(array: any[]): any[];

// ---- Invoke Functions (re-dispatch motion) ----

/** Called to invoke onLinear in the post engine. Returns true on success.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#abe2741ffa77244c8bd6ac1391cfae611 */
declare function invokeOnLinear(x: number, y: number, z: number, feedrate: number): boolean;
/** Called to invoke onLinear5D in the post engine. Returns true on success.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#abaf22029e26d5f51421fe4166506a1c6 */
declare function invokeOnLinear5D(x: number, y: number, z: number, dx: number, dy: number, dz: number, feedrate: number): boolean;
/** Called to invoke onSpindleSpeed in the post engine. Returns true on success.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aa3ca0ba6f36a8b5919a573d00d2a7f23 */
declare function invokeOnSpindleSpeed(spindleSpeed: number): boolean;
/** Call to activate and setup Polar Mode. Returns the polar transformed initial position and direction as a pair of vectors. var x_axis = new Vector (1, 0, 0); var posDir = activatePolarMode (0.01, cOutput.getCurrent(), x_axis); var x = posDir. first . x ; var y = posDir.first.y; var z = posDir.first.z; var a = posDir.second.x; var b = posDir.second.y; var c = posDir.second.z;
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ae1f3a4050caf79e540af1d476f30b36c */
declare function activatePolarMode(tolerance: number, currentAngle: number, polarDirection: Vector, interpolateRapidMoves: boolean, optimizeType: number): VectorPair;
/** Call to check if Polar Mode is active. Returns true if activatePolarMode() has been called.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a477da21ffbfa7f66d5b22e49cfc057da */
declare function isPolarModeActive(): boolean;
/** Activates automatic polar mode handling. The supported options are:
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a1b625e72dad004c2a77eb9279089c7e2 */
declare function activateAutoPolarMode(options: object): void;

// ---- Expanded motion callbacks (called by expandCyclePoint) ----

/** onExpandedLinear() calls the onLinear() entry function and lets the post processor know that the current position has changed at the same time. You should generally not call onLinear() directly.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aaa669c442e5def9ccc580358f48526e3 */
declare function onExpandedLinear(x: number, y: number, z: number, feed: number): void;
/** Returns true if the section has a previous record.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ae1e59cc8cd9f9354b478b8af6b472331 */
declare function hasPreviousRecord(): boolean;
/** Returns true if the section has a next record.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ab61a4e3f43cedde851db7f3237e4b91c */
declare function hasNextRecord(): boolean;
/** Invoked during post processing when the machine configuration changes.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a6c28394831f15db91439641be42789aa */
declare function onMachine(): void;

/** Invoked during initialization before the first section.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a65df793600ddb8e3b4dbece18d24438d */
declare function onOpen(): void;

/** Pass-through entry function.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ac85eb260176dc186767f8e93c650c0c8 */
declare function onPassThrough(value: any): void;

/** Called for each comment. */
declare function onComment(comment: string): void;

/** Called at the start of each section (operation). */
declare function onSection(): void;

/** Entry function invoked for dwelling.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a63f5afc08861039dd5c28fa82f5ef59e */
declare function onDwell(seconds: number): void;

/** Entry function invoked for linear motion at rapid traverse.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ad8921f5ec26f581064354f9feb4f928c */
declare function onRapid(x: number, y: number, z: number): void;

/** Entry function for circular motion.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a69cdac7a0532f704ede16ce81511ee30 */
declare function onCircular(clockwise: boolean, cx: number, cy: number, cz: number, x: number, y: number, z: number, feedrate: number): void;

/** Entry function invoked for linear 5-axis motion at feed. The tool axis may also be returned in machine angles depending on the mode in accordance with the active machine configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a44c2cdde97b41e1ab81bd836ee859aa2 */
declare function onLinear5D(x: number, y: number, z: number, dx: number, dy: number, dz: number, feedrate: number): void;

/** Entry function invoked for 5-axis motion when machine axis rewind is required. This is called before performing a machine rewind in the kernel, as onRewindMachine() is now deprecated. Returns True if we don't want the kernel to perform the machine rewind, False otherwise.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a071236cc3d3d72695f0f11bd1e2e723d */
declare function onRewindMachineEntry(a: number, b: number, c: number): void;

/** Entry function invoked during a machine rewind procedure. It needs to output the code for returning from safe position after indexing rotaries.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9e63cd78348e19028e0203569a90bb6c */
declare function onReturnFromSafeRetractPosition(x: number, y: number, z: number): void;

/** Entry function invoked when the movement type changes.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a5bb516854f5f66d7a4e084c3a45e7a13 */
declare function onMovement(movement: number): void;

/** Entry function invoked when the radius compensation mode changes.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ab82fdefb6ee23686a3c945dcb7147718 */
declare function onRadiusCompensation(): void;

/** Entry function invoked when the tool compensation changes. Only used for specific tool types for which dual compensation is defined.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af4166ab645097eaea7f43c76f4d7ae80 */
declare function onToolCompensation(compensation: number): void;

/** onCyclePoint() is the entry function for cycle positions. The function expands all well-known cycles by default. The specified position is the center of the hole for drilling or equivalent cycles. You should always use cycle.bottom as the bottom coordinate if defined.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a4e1cf241ab139ce858a305e36dfffb93 */
declare function onCyclePoint(x: number, y: number, z: number): void;

/** The onCyclePathEnd() entry function is invoked at the ending of cycle toolpath.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a0ee125703ef4618fd8bc76e57a66c5d7 */
declare function onCyclePathEnd(): void;

/** Entry function invoked for well-known commands. The known commands are:
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af3a71236d7fe350fd33bdc14b0c7a4c6 */
declare function onCommand(command: number): void;

/** Called for Manual NC commands. */
declare function onManualNC(command: number, value: string): void;

/** Called for machine commands. */
declare function onMachineCommand(command: number): void;

/** Called when spindle orientation is required. */
declare function onOrientateSpindle(angle: number): void;

/** Called after the last posted operation of a Part Alignment. */
declare function onLiveAlignment(): void;

/** Entry function invoked for circular extrusion motion at feed.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aba9be73978debf179c90eba8a1a0cb96 */
declare function onCircularExtrude(clockwise: boolean, cx: number, cy: number, cz: number, x: number, y: number, z: number, feedrate: number, extrusionLength: number): void;

/** Entry function invoked at the end of a layer in a DED toolpath.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a927e748ba62cc2904121381791ed14c4 */
declare function onLayerEnd(layerNumber: number): void;

/** Entry function invoked when the extruder is changed in an additive FFF toolpath.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a6bc70ee5e27a6df284a81caef1b12aeb */
declare function onExtruderChange(extruderId: number): void;

/** Entry function invoked when the bed temperature is changed in an additive FFF toolpath.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a03ae658a31598983f59dd743f10d7bb4 */
declare function onBedTemp(temp: number, wait: boolean): void;

/** Entry function invoked when the max axis acceleration is changed in an additive FFF toolpath.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a79a06a70f46244b796c7c0061d27b54d */
declare function onMaxAcceleration(xAxis: number, yAxis: number, zAxis: number, eAxis: number): void;

/** Entry function invoked when the axis jerk is changed in an additive FFF toolpath.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#afd0052ff663b0c7572683014d12e9f60 */
declare function onJerk(xAxis: number, yAxis: number, zAxis: number, eAxis: number): void;

/** Called at the end of each section (operation). */
declare function onSectionEnd(): void;

/** Called at the end of special cycle sections. */
declare function onSectionEndSpecialCycle(): void;

/** Called at post processing completion. Output the program footer here. */
declare function onClose(): void;

/** Called after post processing has completed. The output file is unlocked. */
declare function onTerminate(): void;
