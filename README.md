<a username="readme-top"></a>
<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/KevzPeter/Online-Controller-Tester">
    <img src="media/PS5-Controller.png" alt="Logo" width="80" height="60">
  </a>

  <h3 align="center">Online Controller Tester</h3>

  <p align="center">
    🎮 Test your Playstation DualSense or Xbox Controllers using this interactive 3D visualization!
    <br />
    <br />
    <a href="https://online-controller-tester.vercel.app/">✨ View Demo</a>
    ·
    <a href="https://github.com/KevzPeter/online-controller-tester/issues">🐛 Report Bug</a>
    ·
    <a href="https://github.com/KevzPeter/online-controller-tester/issues">💁🏽 Request Feature</a>
  </p>
</div>


<!-- DEMO -->
## Demo

<div align="center">
<img  src="media/demo_new.png" alt="Screenshot" width="800" height="374">
</div>

<!-- ENHANCEMENTS -->
## Planned Enhancements

- [x] Support for Xbox Controllers
- [x] Add 3D Xbox Controller model
- [ ] Make 3D model interactive 
    - [ ] Highlight active buttons
    - [ ] Movable analog sticks

## Development

Use Node.js 24.x and npm. With nvm, run `nvm install 24` and `nvm use 24`
(or `nvm install` and `nvm use` with nvm-sh).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Development and production builds use Webpack to
preserve the SVG component loader. The app uses Next.js 16 and React 19.

Before opening a pull request, run `npm run check`, which runs:

- `npm run lint`: ESLint with Next.js core web vitals rules.
- `npm run typecheck`: Generate Next.js declarations, then check TypeScript without JavaScript output.
- `npm run build`: Production build, including downloading the Google font.

GitHub Actions runs these checks on pushes and pull requests under Node.js 24.
Use `npm start` to serve a completed production build. Controller hardware and
browser behavior are not covered by these checks.

### Vercel deployment

Set the project's Node.js version to `24.x`; `package.json` also declares this
runtime. Vercel manages the Node 24 minor and patch version. Validate a preview
build and confirm Node 24 in its build logs before promoting to production.
Keep the last successful deployment available for rollback. If a regression
occurs, restore that deployment first, then revert the migration as a unit;
do not depend on rebuilding with Node 20.

### Animated DualSense model

The 3D view uses `public/dualsense-animated.glb`, generated from the original
`public/PS5 DualSense Controller.stl`. Run `npm run model:dualsense` to reproduce
the asset. The script preserves every source triangle, separates the joined
button covers and Create/Options caps, and assigns names and pivots to the controls. It checks the
source SHA-256 before applying its model-specific extraction map.

Connect a DualSense over USB or Bluetooth and press a button to expose it to the
browser. Face buttons, D-pad directions, Create, Options, touchpad click, PS,
L1/R1, L2/R2, and L3/R3 highlight and move independently. Sticks tilt with their
axes; trigger travel follows analog pressure. Existing calibration settings
apply. Drag to orbit and scroll/pinch to zoom.

The browser must expose the standard Gamepad mapping. Touchpad click uses the
DualSense extension at index 17. Touch coordinates, adaptive-trigger resistance,
and the microphone mute button are not exposed by the standard Gamepad API;
the mute mesh remains static. The OS may also intercept the PS button.

For manual validation, test every button individually, D-pad diagonals, both
sticks while clicking L3/R3, partial/full trigger pulls, simultaneous inputs,
disconnect/reconnect, saved calibration, and mouse/touch camera controls.

### Animated Xbox Elite model

The Xbox view uses `public/xbox-elite-animated.gltf` and its `.bin`, generated
with `npm run model:xbox` from `public/xbox_elite_controller/scene.gltf`.
The source folder stays unchanged. The generated model references its original
textures and retains every triangle, normal, tangent, UV, and material assignment
while normalizing the pose and splitting the controls into named groups.
Both source geometry files are hash-checked before generation.

A/B/X/Y caps and lettering move together. View, Menu, Xbox, LB/RB, LT/RT,
and both sticks respond independently, including analog trigger travel, stick
tilt, and stick clicks. The single D-pad dish tilts with directional input and
highlights only the pressed sectors, including diagonals. Existing calibration,
reduced-motion preferences, and disconnect reset apply.

The [standard browser mapping](https://www.w3.org/TR/gamepad/#remapping)
does not assign separate indices to Elite paddles, the profile selector,
pairing button, or trigger locks. Those parts remain static. A remapped paddle
press highlights the standard button reported by the controller; it cannot be
distinguished from pressing that button directly. The OS may intercept Xbox.

The temporary preview button above the 3D view shows the other model while
keeping the connected controller active. A DualSense can animate the Xbox model,
and an Xbox controller can animate the PS5 model using the shared standard
Gamepad mapping. Turn preview off to restore automatic model selection.

Based on [Xbox Elite Controller](https://sketchfab.com/3d-models/xbox-elite-controller-32aad0ff25f7446b8afe649ea3cc9e43)
by [Rusfort](https://sketchfab.com/Rusfort), licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Modifications: separated controls, normalized pose/scale, animation pivots,
and D-pad sectors. Original attribution is in
`public/xbox_elite_controller/license.txt` and the generated GLTF metadata.

<!-- CONTRIBUTING -->
## Contributing

If you'd like to add enhancements, please fork the repo and create a pull request. You can also open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
[contributors-url]: https://github.com/othneildrew/Best-README-Template/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=for-the-badge
[forks-url]: https://github.com/othneildrew/Best-README-Template/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=for-the-badge
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=for-the-badge
[issues-url]: https://github.com/othneildrew/Best-README-Template/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/othneildrew/Best-README-Template/blob/master/LICENSE.txt
[product-screenshot]: images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Docker]: https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://docker.com/
